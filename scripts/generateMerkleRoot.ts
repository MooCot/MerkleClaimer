import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

async function main() {
  // Список адресов, которые могут выполнять `claim`
  const whitelist = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
  ];

  // Хешируем каждый адрес
  const leafNodes = whitelist.map((addr) => keccak256(addr));
  
  // Создаем Merkle Tree
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  // Генерируем корень дерева
  const merkleRoot = merkleTree.getHexRoot();

  console.log("Merkle Root:", merkleRoot);

  // (Необязательно) Генерируем доказательство для первого адреса
  const proof = merkleTree.getHexProof(leafNodes[0]);
  console.log("Proof for first address:", proof);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
