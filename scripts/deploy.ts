import { ethers } from "hardhat";

async function main() {
  // Укажите корень дерева Merkle
  const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // Замените на ваш корень Merkle Tree scripts/generateMerkleRoot.ts

  // Получаем фабрику контракта
  const MerkleClaimer = await ethers.getContractFactory("MerkleClaimer");

  // Разворачиваем контракт
  const merkleClaimer = await MerkleClaimer.deploy(merkleRoot);

  // Ожидаем завершения транзакции
  await merkleClaimer.waitForDeployment();

  console.log(`MerkleClaimer deployed to: ${merkleClaimer.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });