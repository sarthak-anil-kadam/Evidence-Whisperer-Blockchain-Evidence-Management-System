const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { ethers, JsonRpcProvider } = require('ethers');
const nodemailer = require('nodemailer'); // <-- IMPORTED NODEMAILER

const app = express();
const PORT = 5001; 

// --- 1. MIDDLEWARE ---
app.use(cors({ origin: '*' })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// --- 2. EMAIL CONFIGURATION ---
// IMPORTANT: Replace with your actual project email and App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'evidence.whisperer.sys@gmail.com',  // <-- PUT YOUR SENDER EMAIL HERE
        pass: 'umpchmneopstqzfh'    // <-- PUT YOUR GMAIL APP PASSWORD HERE
    }
});

// --- 3. STATIC FILES ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// --- 4. CONFIGURATION ---
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; 
const RPC_URL = "http://127.0.0.1:8545"; 

const ABI = [
    "function addEvidence(string _id, string _caseId, string _hash, string _type, string _custodian) public",
    "function transferCustody(string _id, string _newCustodian) public",
    "function getAllEvidence() public view returns (tuple(string id, string caseId, string fileHash, string docType, string custodian, uint256 timestamp)[])"
];

// --- 5. DATABASE SETUP ---
const DB_FILE = path.join(__dirname, 'database.json');

const ADMIN_ACCOUNT = {
    id: "ADMIN@", 
    name: "System Chief", 
    pass: "Kadam@kkwp1", 
    email: "chief@forensics.gov", // <-- Added Admin Email
    photo: "https://via.placeholder.com/150/FFD700/000000?text=ADMIN", 
    signature: "",
    role: "ADMIN",
    status: "ACTIVE",
    station: "HEADQUARTERS"
};

const initDB = () => {
    let db = { users: [], cases: [], evidenceMeta: [] };
    if (fs.existsSync(DB_FILE)) {
        try {
            db = JSON.parse(fs.readFileSync(DB_FILE));
        } catch (e) { console.error("DB Parse Error, resetting."); }
    }

    // Force Admin Existence
    const adminIdx = db.users.findIndex(u => u.id === "ADMIN@");
    if (adminIdx === -1) {
        db.users.push(ADMIN_ACCOUNT);
    } else {
        db.users[adminIdx] = { ...db.users[adminIdx], ...ADMIN_ACCOUNT };
    }

    // Ensure Default Officer Exists
    if (!db.users.find(u => u.id === "LE-8842")) {
        db.users.push({
            id: "LE-8842", name: "Officer Miller", pass: "password", email: "miller@forensics.gov", // <-- Added Officer Email
            photo: "https://randomuser.me/api/portraits/men/32.jpg", signature: "", 
            role: "OFFICER", status: "ACTIVE", station: "Cyber Command"
        });
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};
initDB();

const getDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- 6. UPLOAD CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- 7. ROUTES ---

// REGISTER (Now captures Official Email for Zero-Trust verification)
app.post('/api/register', upload.fields([{ name: 'photo' }, { name: 'signature' }]), (req, res) => {
    try {
        const { name, id, pass, station, email } = req.body;
        if (id === "ADMIN@") return res.status(403).json({ error: "Cannot register as Admin" });

        const db = getDB();
        if (db.users.find(u => u.id === id)) return res.status(400).json({ error: "Badge ID exists" });

        const photoUrl = req.files['photo'] ? `http://127.0.0.1:${PORT}/uploads/${req.files['photo'][0].filename}` : "";
        const sigUrl = req.files['signature'] ? `http://127.0.0.1:${PORT}/uploads/${req.files['signature'][0].filename}` : "";

        db.users.push({ 
            id, name, pass, station, email: email || "unknown@forensics.gov", // <-- Save Email
            photo: photoUrl, signature: sigUrl, 
            role: "OFFICER", 
            status: "PENDING" 
        });
        saveDB(db);
        res.json({ success: true, message: "Registration pending Admin approval." });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { id, pass } = req.body;
    const cleanId = id.trim();
    const cleanPass = pass.trim();

    const user = getDB().users.find(u => u.id === cleanId && u.pass === cleanPass);
    
    if (!user) return res.status(401).json({ error: "Invalid Credentials" });
    
    if (user.role === 'ADMIN') return res.json({ success: true, user });

    if (user.status === "PENDING") {
        return res.status(403).json({ error: "Account Pending Approval. Contact Chief." });
    }
    
    res.json({ success: true, user });
});

// ADMIN ROUTES
app.get('/api/admin/users', (req, res) => {
    res.json(getDB().users);
});

app.post('/api/admin/action', (req, res) => {
    const { targetId, action } = req.body;
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === targetId);
    
    if (idx === -1) return res.status(404).json({ error: "User not found" });
    if (db.users[idx].id === "ADMIN@") return res.status(403).json({ error: "Cannot modify Admin" });

    if (action === 'approve') {
        // --- SECURE EMAIL VERIFICATION LOGIC ---
        // Generate a secure 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        db.users[idx].status = 'ACTIVE';
        
        // Overwrite the original password with the generated OTP code!
        db.users[idx].pass = otpCode; 

        // Send the email to the legitimate officer's inbox
        const mailOptions = {
            from: 'YOUR_PROJECT_EMAIL@gmail.com', // <-- REPLACE WITH SENDER EMAIL
            to: db.users[idx].email,
            subject: 'EVIDENCE WHISPERER - Access Approved',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #030305; padding: 40px; color: white;">
                    <div style="background-color: #101015; padding: 30px; border-radius: 12px; border: 1px solid #00f3ff;">
                        <h2 style="color: #00f3ff; margin-top:0;">NODE ACCESS APPROVED</h2>
                        <p style="color: #f1f5f9;">Officer <b>${db.users[idx].name}</b>,</p>
                        <p style="color: #f1f5f9;">Your access request has been verified by Central Command. Your node access is now active.</p>
                        <div style="background: rgba(0, 243, 255, 0.1); padding: 20px; border: 1px solid #00f3ff; border-radius: 8px; text-align: center; margin: 30px 0;">
                            <p style="margin: 0; font-size: 14px; color: #8b9bb4;">TEMPORARY SECURE LOGIN CODE:</p>
                            <h1 style="margin: 10px 0 0 0; color: #00f3ff; letter-spacing: 8px; font-size: 32px;">${otpCode}</h1>
                        </div>
                        <p style="color: #8b9bb4; font-size: 12px;">Use this code as your password to login. Ensure you update your password immediately in your Profile Settings.</p>
                        <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
                        <p style="font-size: 10px; color: #666;">This is an automated system message from Evidence Whisperer Core. Do not reply.</p>
                    </div>
                </div>
            `
        };

        // Dispatch email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('🚨 Error sending email:', error.message);
            } else {
                console.log('✉️ Secure OTP Email successfully sent to ' + db.users[idx].email);
            }
        });

    } else if (action === 'reject' || action === 'remove') {
        db.users.splice(idx, 1);
    }

    saveDB(db);
    res.json({ success: true });
});

// OFFICER ROUTES
app.get('/api/user/:id', (req, res) => {
    const user = getDB().users.find(u => u.id === req.params.id);
    res.json({ found: !!user, ...user });
});

app.post('/api/profile', upload.fields([{ name: 'photo' }, { name: 'signature' }]), (req, res) => {
    const { id, pass, name, phone, email, station } = req.body; 
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx > -1) {
        if(phone) db.users[idx].phone = phone;
        if(email) db.users[idx].email = email;
        if(station) db.users[idx].station = station;
        if(pass) db.users[idx].pass = pass;
        if(name) db.users[idx].name = name;

        if(req.files['photo']) db.users[idx].photo = `http://127.0.0.1:${PORT}/uploads/${req.files['photo'][0].filename}`;
        if(req.files['signature']) db.users[idx].signature = `http://127.0.0.1:${PORT}/uploads/${req.files['signature'][0].filename}`;
        
        saveDB(db);
        res.json({ success: true, user: db.users[idx] });
    }
});

app.post('/api/cases', (req, res) => {
    const db = getDB();
    db.cases.push({ ...req.body, status: "OPEN", date: new Date().toLocaleDateString() });
    saveDB(db);
    res.json({ success: true });
});
app.get('/api/cases', (req, res) => res.json(getDB().cases));

app.post('/api/evidence', upload.single('file'), async (req, res) => {
    try {
        const { id, caseId, type, desc, custodian, officerId } = req.body;
        const fileUrl = `http://127.0.0.1:${PORT}/uploads/${req.file.filename}`;
        
        try {
            if (CONTRACT_ADDRESS.length > 10) {
                const provider = new JsonRpcProvider(RPC_URL);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
                await (await contract.addEvidence(id, caseId, req.file.filename, type, custodian)).wait();
            }
        } catch(e) { console.log("Blockchain skipped:", e.message); }

        const db = getDB();
        // Ensuring custodian is saved to DB for fallback
        db.evidenceMeta.push({ id, caseId, desc, fileUrl, officerId, type, fileName: req.file.originalname, custodian: custodian });
        saveDB(db);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// FIX: Improved Ledger Logic to ensure correct Custodian/Count
app.get('/api/ledger', async (req, res) => {
    const db = getDB();
    let chainData = [];
    
    // 1. Try to fetch Blockchain Data
    try {
        if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.length > 10) {
            const provider = new JsonRpcProvider(RPC_URL);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            // Quick timeout to default to DB if blockchain is slow/down
            const timeout = new Promise((_, reject) => setTimeout(() => reject("Timeout"), 1000));
            chainData = await Promise.race([contract.getAllEvidence(), timeout]);
        }
    } catch (e) {
        // console.log("Ledger Sync Skipped");
    }

    // 2. Map Local DB items. If blockchain data exists, use it. If not, use local DB data.
    const merged = db.evidenceMeta.map(local => {
        const onChain = Array.isArray(chainData) ? chainData.find(c => c.id === local.id) : null;
        return {
            id: local.id,
            caseId: local.caseId,
            type: local.type,
            fileUrl: local.fileUrl,
            fileName: local.fileName,
            // Fallback: Check chain -> Check local -> Check officerId -> Default
            custodian: onChain ? onChain.custodian : (local.custodian || local.officerId || "Local"),
            hash: onChain ? onChain.fileHash : "OFFLINE"
        };
    });

    res.json(merged.reverse());
});

app.post('/api/transfer-case', async (req, res) => {
    try {
        const { caseId, newCustodian, currentOfficer } = req.body;
        const db = getDB();
        const caseIdx = db.cases.findIndex(c => c.id === caseId);
        if (caseIdx === -1) return res.status(404).json({ error: "Case not found" });
        if (db.cases[caseIdx].officerId !== currentOfficer) return res.status(403).json({ error: "Unauthorized" });

        db.cases[caseIdx].officerId = newCustodian;
        const caseEvidence = db.evidenceMeta.filter(e => e.caseId === caseId);
        
        for (const ev of caseEvidence) {
            const evIdx = db.evidenceMeta.findIndex(e => e.id === ev.id);
            // Update Local Custodian
            if (evIdx > -1) {
                db.evidenceMeta[evIdx].officerId = newCustodian;
                db.evidenceMeta[evIdx].custodian = newCustodian;
            }
            // Update Blockchain
            try {
                if (CONTRACT_ADDRESS.length > 10) {
                    const provider = new JsonRpcProvider(RPC_URL);
                    const signer = await provider.getSigner(); 
                    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
                    await (await contract.transferCustody(ev.id, newCustodian)).wait();
                }
            } catch(e) {}
        }
        saveDB(db);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on http://127.0.0.1:${PORT}`));

/*
    //The project tech at the matoshri aasrabai institude of enginnering and research centre
    //Blockchain, Frontend, Backend
    //To improve the blockchain integration in the local system , and add the cloud storage pacakage
    //ganache platform intergartion
*/