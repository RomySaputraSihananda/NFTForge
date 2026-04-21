// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract NFTForge is ERC721URIStorage, Ownable, IERC721Receiver, ReentrancyGuard, IERC2981 {

    uint256 private _nextTokenId = 1;
    uint256 public constant MAX_SUPPLY   = 10_000;
    uint256 public constant MINT_PRICE   = 0.01 ether;
    uint256 public constant ROYALTY_BPS  = 250;

    address public royaltyReceiver;
    string  private _contractBaseURI;

    struct Listing {
        address seller;
        uint256 price;
        bool    active;
    }

    mapping(uint256 => Listing) public listings;

    event Minted(address indexed to, uint256 tokenId, string tokenURI);
    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
    event Sale(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);
    event Burned(address indexed owner, uint256 tokenId);
    event Withdrawn(address indexed to, uint256 amount);
    event RoyaltyReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

    error MaxSupplyReached();
    error InsufficientPayment();
    error WithdrawFailed();
    error NotTokenOwner();
    error NotListed();
    error InvalidPrice();
    error EmptyTokenURI();
    error TokenIsListed();
    error TransferFailed();
    error ZeroAddress();

    constructor(string memory baseURI, address _royaltyReceiver)
        ERC721("NFTForge", "FORGE")
        Ownable(msg.sender)
    {
        if (_royaltyReceiver == address(0)) revert ZeroAddress();
        _contractBaseURI = baseURI;
        royaltyReceiver  = _royaltyReceiver;
    }

    function mint(string memory tokenURI_) external payable nonReentrant returns (uint256) {
        if (_nextTokenId > MAX_SUPPLY)  revert MaxSupplyReached();
        if (msg.value < MINT_PRICE)     revert InsufficientPayment();
        if (bytes(tokenURI_).length == 0) revert EmptyTokenURI();

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit Minted(msg.sender, tokenId, tokenURI_);
        return tokenId;
    }

    function mintTo(address to, string memory tokenURI_) external onlyOwner returns (uint256) {
        if (_nextTokenId > MAX_SUPPLY)    revert MaxSupplyReached();
        if (to == address(0))             revert ZeroAddress();
        if (bytes(tokenURI_).length == 0) revert EmptyTokenURI();

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit Minted(to, tokenId, tokenURI_);
        return tokenId;
    }

    function listForSale(uint256 tokenId, uint256 price) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0)                     revert InvalidPrice();

        safeTransferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = Listing({ seller: msg.sender, price: price, active: true });

        emit Listed(tokenId, msg.sender, price);
    }

    function updateListing(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        if (!listing.active)              revert NotListed();
        if (listing.seller != msg.sender) revert NotTokenOwner();
        if (newPrice == 0)                revert InvalidPrice();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit ListingUpdated(tokenId, oldPrice, newPrice);
    }

    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        if (!listing.active)        revert NotListed();
        if (msg.value < listing.price) revert InsufficientPayment();

        address seller = listing.seller;
        uint256 price  = listing.price;

        listing.active = false;

        _safeTransfer(address(this), msg.sender, tokenId, "");

        uint256 royalty       = (price * ROYALTY_BPS) / 10_000;
        uint256 sellerAmount  = price - royalty;

        (bool okSeller, ) = seller.call{ value: sellerAmount }("");
        if (!okSeller) revert TransferFailed();

        (bool okRoyalty, ) = royaltyReceiver.call{ value: royalty }("");
        if (!okRoyalty) revert TransferFailed();

        if (msg.value > price) {
            (bool okRefund, ) = msg.sender.call{ value: msg.value - price }("");
            if (!okRefund) revert TransferFailed();
        }

        emit Sale(tokenId, seller, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        if (!listing.active)              revert NotListed();
        if (listing.seller != msg.sender) revert NotTokenOwner();

        listing.active = false;
        _safeTransfer(address(this), msg.sender, tokenId, "");

        emit ListingCancelled(tokenId);
    }

    function burn(uint256 tokenId) external {
        if (listings[tokenId].active)       revert TokenIsListed();
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        _burn(tokenId);
        emit Burned(msg.sender, tokenId);
    }

    function royaltyInfo(uint256, uint256 salePrice)
        external view override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (royaltyReceiver, (salePrice * ROYALTY_BPS) / 10_000);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function contractURI() external view returns (string memory) {
        return _contractBaseURI;
    }

    function setContractURI(string memory baseURI) external onlyOwner {
        _contractBaseURI = baseURI;
    }

    function setRoyaltyReceiver(address newReceiver) external onlyOwner {
        if (newReceiver == address(0)) revert ZeroAddress();
        emit RoyaltyReceiverUpdated(royaltyReceiver, newReceiver);
        royaltyReceiver = newReceiver;
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool ok, ) = owner().call{ value: balance }("");
        if (!ok) revert WithdrawFailed();
        emit Withdrawn(owner(), balance);
    }

    function onERC721Received(address, address, uint256, bytes calldata)
        external pure override returns (bytes4)
    {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId
            || super.supportsInterface(interfaceId);
    }
}
