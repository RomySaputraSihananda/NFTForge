import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BASE_URI = "ipfs://QmPlaceholder/";

export default buildModule("NFTForge", (m) => {
  const baseURI         = m.getParameter("baseURI", BASE_URI);
  const royaltyReceiver = m.getParameter("royaltyReceiver", "0xB62812AAAf01Ab0c129Af8365b400a2237e801EE");
  const nftForge = m.contract("NFTForge", [baseURI, royaltyReceiver]);
  return { nftForge };
});
