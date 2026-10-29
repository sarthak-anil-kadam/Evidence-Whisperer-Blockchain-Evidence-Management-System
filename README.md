<div align="center">

<img src="screenshots/banner.png" alt="Evidence Whisperer: Blockchain Evidence Management System" width="100%">

<br>

### Tamper-proof digital evidence and chain of custody, secured on the blockchain

<br>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF100?style=for-the-badge&logo=ethereum&logoColor=black)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)

![1st Prize](https://img.shields.io/badge/🥇_1st_Prize-Technovista_2K26-gold?style=flat-square)
![2nd Prize](https://img.shields.io/badge/🥈_2nd_Prize-TechFest_2K26-silver?style=flat-square)

[**Overview**](#-overview) · [**Product Tour**](#-product-tour) · [**Architecture**](#-architecture) · [**Smart Contract**](#-smart-contract) · [**Run Locally**](#-run-locally) · [**Author**](#-author)

</div>

<!-- DEMO VIDEO: paste your YouTube link here, for example: [▶ Watch the demo](https://youtu.be/...) -->

---

## 📌 Overview

**Evidence Whisperer** is a blockchain-based evidence management system built by **Sarthak Anil Kadam**. Police officers log digital evidence against investigation cases. Every item is recorded on an Ethereum smart contract, and every change of custody is written to a ledger that cannot be altered.

| | |
|---|---|
| 🔐 **Zero-trust onboarding** | Officers apply with badge ID, official email, photo and signature. The admin approves each request, and a one-time access code is emailed to the officer. |
| ⛓️ **Tamper-proof records** | Evidence ID, case ID, file reference, type and custodian are stored on-chain with a timestamp. |
| 🔁 **Chain of custody** | Transfer a whole case to another officer. The new custodian is written to the blockchain and a `CustodyTransferred` event is emitted. |
| ✅ **Integrity check** | Paste any evidence hash to confirm it is verified on-chain. |
| 📄 **Court-ready reports** | Generate a printable chain-of-custody report with the officer's photo, hashes and digital signature. |

---

## 🖥️ Product Tour

### 1. Secure login and officer enrollment

Officers sign in with their badge ID. New officers request access, and nothing is activated until the admin approves it.

<table>
<tr>
<td width="50%"><img src="screenshots/01-login.png" alt="Login screen"></td>
<td width="50%"><img src="screenshots/10-officer-enrollment.png" alt="Officer enrollment form"></td>
</tr>
<tr>
<td align="center"><b>Login</b></td>
<td align="center"><b>Officer enrollment</b></td>
</tr>
</table>

### 2. Dashboard

Active investigations, secured artifacts and recent evidence activity at a glance, with a one-click quick ingest.

<img src="screenshots/02-dashboard.png" alt="Officer dashboard" width="100%">

### 3. Case management

Every investigation gets a unique case ID. Open a case file to see all evidence attached to it.

<img src="screenshots/03-cases.png" alt="Cases list" width="100%">

### 4. Evidence ingestion

Link evidence to a case, choose its type (image, video, document), add details and upload. The record is committed to the blockchain.

<img src="screenshots/04-evidence-ingestion.png" alt="Evidence ingestion form" width="100%">

### 5. Custody transfer

Hand a case over to another officer. The change is recorded on-chain, so the full chain of custody can always be proven.

<img src="screenshots/05-custody-transfer.png" alt="Custody transfer screen" width="100%">

### 6. Blockchain ledger

Every evidence record read straight from the smart contract, with a hash, evidence ID, current custodian and a SECURED status. One click copies the full hash.

<img src="screenshots/06-ledger.png" alt="Blockchain ledger" width="100%">

### 7. Integrity check

Paste a hash and the system confirms whether it exists on-chain, then shows the evidence ID and type.

<img src="screenshots/07-verify.png" alt="Integrity check screen" width="100%">

### 8. Chain-of-custody report

A clean, printable report with the case, officer, badge ID, date, every evidence hash and the officer's digital signature.

<img src="screenshots/08-report.png" alt="Chain of custody report" width="100%">

### 9. Admin command center

The administrator reviews pending requests, approves or revokes officers, and manages the roster.

<img src="screenshots/09-admin-command-center.png" alt="Admin command center" width="100%">

---

## 🏗️ Architecture

```mermaid
flowchart LR
    O[Officer] -->|Upload evidence, transfer custody| F[React Frontend]
    A[Admin] -->|Approve or revoke officers| F
    F -->|REST API| B[Express Backend]
    B -->|ethers.js| C[EvidenceChain Smart Contract]
    C --- H[Hardhat Local Node]
    B -->|Nodemailer| E[Email with one-time access code]
    B --> D[Case data and uploaded files]
```

**How a piece of evidence flows through the system**

1. An officer registers and the admin approves the account.
2. The officer creates a case and uploads evidence.
3. The backend stores the file and calls `addEvidence` on the smart contract.
4. The ledger reads the records back from the blockchain with `getAllEvidence`.
5. When a case changes hands, `transferCustody` records the new custodian on-chain.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Axios |
| **Backend** | Node.js, Express 5, Multer (file uploads), Nodemailer (email), ethers.js |
| **Blockchain** | Solidity 0.8.19, Hardhat, local Ethereum node |
| **Storage** | JSON database and local file storage (demo setup) |

---

## 📜 Smart Contract

`blockchain/contracts/EvidenceChain.sol`

| Function | What it does |
|---|---|
| `addEvidence(...)` | Records an evidence item with its case ID, file reference, type, custodian and timestamp |
| `transferCustody(id, newCustodian)` | Changes the custodian and emits a `CustodyTransferred` event |
| `getAllEvidence()` | Returns the complete evidence ledger |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Officer registration, pending admin approval |
| `POST` | `/api/login` | Login |
| `GET` | `/api/admin/users` | List all users (admin) |
| `POST` | `/api/admin/action` | Approve or revoke an officer (admin) |
| `GET` `POST` | `/api/cases` | List or create cases |
| `POST` | `/api/evidence` | Upload evidence and record it on-chain |
| `GET` | `/api/ledger` | Evidence ledger from the blockchain |
| `POST` | `/api/transfer-case` | Transfer case custody |

---

## 🚀 Run Locally

**Requirements:** Node.js 18 or newer and npm.

<details>
<summary><b>1. Start the blockchain</b></summary>

```bash
cd blockchain
npm install
npx hardhat node
```

Leave this terminal open. In a second terminal, deploy the contract:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed `CONTRACT_ADDRESS`.

</details>

<details>
<summary><b>2. Configure and start the backend</b></summary>

Create `backend/.env`:

```env
CONTRACT_ADDRESS=paste-the-address-here
RPC_URL=http://127.0.0.1:8545
EMAIL_USER=your-sender-email@gmail.com
EMAIL_PASS=your-gmail-app-password
ADMIN_PASSWORD=choose-a-strong-password
```

```bash
cd backend
npm install
node server.js
```

The API runs on `http://127.0.0.1:5001`.

</details>

<details>
<summary><b>3. Start the frontend</b></summary>

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

</details>

<details>
<summary><b>4. First login</b></summary>

Log in with the admin account, approve a registered officer from the Command Center, then log in as that officer to create cases and upload evidence.

</details>

> **Note:** this repository does not include `node_modules`, uploaded files, user data or secrets. Run `npm install` in each folder and create your own `.env`.

---

## 🗺️ Roadmap

- [ ] Store evidence files on IPFS or cloud storage and keep the SHA-256 hash on-chain
- [ ] Replace the JSON database with MongoDB or PostgreSQL
- [ ] Hash passwords and use JWT authentication
- [ ] Deploy the contract to an Ethereum testnet
- [ ] Host the frontend and backend for a live demo

---

## 👨‍💻 Author

<div align="center">

**Sarthak Anil Kadam**
B.Tech CSE student at Pimpri Chinchwad University, Pune · Python Full-Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-sarthak--anil--kadam-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sarthak-anil-kadam/)
[![GitHub](https://img.shields.io/badge/GitHub-sarthak--anil--kadam-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sarthak-anil-kadam)
[![LeetCode](https://img.shields.io/badge/LeetCode-sarthak__kadam4141-FFA116?style=for-the-badge&logo=leetcode&logoColor=black)](https://leetcode.com/u/sarthak-anil-kadam/)

⭐ If you like this project, please star the repository.

</div>
