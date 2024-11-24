import { ethers } from "hardhat";
import { expect } from "chai";
import { MerkleClaimer } from "../typechain-types";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("MerkleClaimer", function () {
  let merkleClaimer: MerkleClaimer;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;

  // Функция хэширования
  const hashFn = keccak256;

  // Переменные для Merkle Tree
  let whitelist: string[] = [];
  let merkleTree: MerkleTree;
  let merkleRoot: string;

  before(async function () {
    // Получаем список аккаунтов из Hardhat
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Составляем whitelist из адресов тестовых аккаунтов
    whitelist = [owner.address, addr1.address, addr2.address];

    // Генерация Merkle Tree и корня
    const leaves = whitelist.map((addr) => keccak256(addr.toLowerCase()));
    merkleTree = new MerkleTree(leaves, hashFn, { sortPairs: true });
    merkleRoot = `0x${merkleTree.getRoot().toString("hex")}`;
  });

  beforeEach(async function () {
    // Деплой контракта
    const MerkleClaimerFactory = await ethers.getContractFactory("MerkleClaimer");
    merkleClaimer = (await MerkleClaimerFactory.deploy(merkleRoot)) as MerkleClaimer;
    await merkleClaimer.waitForDeployment();
  });

  it("should set the correct Merkle root", async function () {
    expect(await merkleClaimer.merkleRoot()).to.equal(merkleRoot);
  });

  it("should allow a valid claim from the whitelist", async function () {
    // Берем первый адрес из whitelist
    const claimerAddress = whitelist[0].toLowerCase();
    const proof = merkleTree.getHexProof(keccak256(claimerAddress));
    // Получаем signer для адреса из whitelist
    const claimer = owner; // используем owner как claimer для теста
    // Выполняем функцию `claim` от имени `claimer`
    const tx = await merkleClaimer.connect(claimer).claim(proof);
    await tx.wait();

    // Проверяем, что claim выполнен
    expect(await merkleClaimer.hasClaimed(claimerAddress)).to.be.true;
  });

  it("should reject an invalid claim", async function () {
    const invalidAddress = addr3.address;
    const proof = merkleTree.getHexProof(hashFn(invalidAddress));

    await expect(
      merkleClaimer.connect(addr3).claim(proof)
    ).to.be.revertedWith("Invalid proof");
  });

  it("should reject a double claim", async function () {
    // Берем первый адрес из whitelist
    const claimerAddress = whitelist[0];
    const proof = merkleTree.getHexProof(keccak256(claimerAddress));
  
    // Получаем соответствующий signer
    const claimer = owner; // используем owner как claimer для теста
  
    // Первый вызов claim
    const tx = await merkleClaimer.connect(claimer).claim(proof);
    await tx.wait();
  
    // Попытка второго вызова claim
    await expect(
      merkleClaimer.connect(claimer).claim(proof)
    ).to.be.revertedWith("Already claimed");
  });

  it("should allow the owner to update the Merkle root", async function () {
    const newWhitelist = [
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    ];
    const newLeaves = newWhitelist.map((addr) => hashFn(addr));
    const newMerkleTree = new MerkleTree(newLeaves, hashFn, { sortPairs: true });
    const newMerkleRoot = `0x${newMerkleTree.getRoot().toString("hex")}`;

    const tx = await merkleClaimer.setMerkleRoot(newMerkleRoot);
    await tx.wait();

    expect(await merkleClaimer.merkleRoot()).to.equal(newMerkleRoot);
  });
});
