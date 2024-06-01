const { name } = require('ejs');
const mongoose = require('mongoose');

main().then(() => {
    console.log("Connected to database");
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/hms_database');
};




const adminSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    email: {
        type: String,


    },
    username: {
        type: String,


    },
    password: {
        type: String,

    }
});

const doctorSchema = new mongoose.Schema({
    doc_id: {
        type: String,
    },
    full_name: {
        type: String,
    },
    email: {
        type: String,
    },
    contact_number: {
        type: String,
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    pincode: {
        type: Number,
    },
    specialty: {
        type: String,
    },
    experience: {
        type: Number,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    status: {
        type: String,
        default: "Offline",
    },
    qualification: {
        type: String,
    },
    notes: {
        type: String,
    },
    bio: {
        type: String,
        default: "No Bio"
    },
    pic: {
        type: String,
        default: "default.jpg"
    }
});

const appointmentSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    email: {
        type: String,


    },
    contact: {
        type: String,
        minLength: 10,

    },
    dob: {
        type: Date,
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
    },
    address: {
        type: String,
    },
    pincode: {
        type: String,
        minLength: 6,
        maxLength: 6,
    },
    app_doc: {
        type: String
    },
    app_date: {
        type: Date,
    },
    reason: {
        type: String,
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        default: "Pending"
    }
});

const empSchema = new mongoose.Schema({
    employee_id: {
        type: String,

    },
    full_name: {
        type: String,

    },
    email: {
        type: String,


    },
    contact_number: {
        type: String,
        minLength: 10,

    },
    date_of_birth: {
        type: Date,
    },
    age: {
        type: Number,
        min: 15,
    },
    gender: {
        type: String,
    },
    address: {
        type: String
    },
    pincode: {
        type: String,
        minLength: 6,
        maxLength: 6,
    },
    department: {
        type: String,
    },
    position: {
        type: String,
    },
    salary: {
        type: Number,
    },
    qualification: {
        type: String,
    },
    experience: {
        type: Number,
    }
});

const labSchema = new mongoose.Schema({
    patient_id: {
        type: String,
    },
    name: {
        type: String,
    },
    ailment: {
        type: String,
    },
    type: {
        type: String,
    },
    lab_tests: {
        type: String,
    },
    lab_results: {
        type: String,
    },
    result_date: {
        type: Date,
    },
    heart_rate: {
        type: Number,
    },
    blood_pressure: {
        type: String
    },
    temperature: {
        type: Number,
    },
    resp_rate: {
        type: Number,
    },
    oxygen_sat: {
        type: Number,
    }
});

const patientSchema = new mongoose.Schema({
    patient_id: {
        type: String,

    },
    name: {
        type: String,

    },
    email: {
        type: String,


    },
    dob: {
        type: Date,
    },
    age: {
        type: Number,
        min: 15,
    },
    gender: {
        type: String,
    },
    contact: {
        type: String,
        minLength: 10,

    },
    emergency_contact: {
        type: String,
        minLength: 10,
    },
    address: {
        type: String
    },
    marital_status: {
        type: String,
    },
    ailment: {
        type: String,
    },
    type: {
        type: String,
    },
    doc_assign: {
        type: String,
    },
    treat_status: {
        type: String,
        default: "Ongoing",
    }
});

const prescriptionSchema = new mongoose.Schema({
    patient_id: {
        type: String,
        unique: true,

    },
    name: {
        type: String,

    },
    age: {
        type: Number,
    },
    address: {
        type: String,
    },
    type: {
        type: String,
    },
    ailment: {
        type: String,
    },
    notes: {
        type: String,
    }
});

const pharmacySchema = new mongoose.Schema({
    name: {
        type: String,

    },
    quantity: {
        type: Number,

    },
    category: {
        type: String,
    },
    vendor: {
        type: String,
    },
    barcode_number: {
        type: String,


    },
    description: {
        type: String,
    }
});


const Admin = new mongoose.model("Admin", adminSchema);
const Doctor = new mongoose.model("Doctor", doctorSchema);
const Appointment = new mongoose.model("Appointment", appointmentSchema);
const Employee = new mongoose.model("Employee", empSchema);
const LabReport = new mongoose.model("LabReport", labSchema);
const Patient = new mongoose.model("Patient", patientSchema);
const Prescription = new mongoose.model("Prescription", prescriptionSchema);
const Pharmacy = new mongoose.model("Pharmacy", pharmacySchema);


//Admin data
const adminData = [
    {
        name: "Admin",
        email: "admin@example.com",
        username: "admin",
        password: "admin"
    }
];

Admin.insertMany(adminData).then(() => {
    console.log("Admins inserted successfully");
}).catch(err => {
    console.log("Error inserting admins:", err);
});


//Doctor Data
const doctorData = [
    {
        doc_id: "DO-9593898",
        full_name: "Aarav Mehta",
        email: "aarav.mehta@example.com",
        contact_number: "+91-9876543210",
        dob: "1980-10-23",
        age: 43,
        gender: "Male",
        address: "Apt 833, Andheri West, Mumbai",
        pincode: 400053,
        specialty: "Cardiology",
        experience: 20,
        username: "aarav.mehta",
        password: "tH0#1EEnUw",
        status: "Online",
        qualification: "MD (Doctor of Medicine)"
    },
    {
        doc_id: "DO-4640764",
        full_name: "Maya Iyer",
        email: "maya.iyer@example.com",
        contact_number: "+91-9876543211",
        dob: "1985-02-06",
        age: 39,
        gender: "Female",
        address: "Apt 1384, Koramangala, Bangalore",
        pincode: 560034,
        specialty: "Neurology",
        experience: 15,
        username: "maya.iyer",
        password: "cE1`Iwnuvyt4",
        status: "Offline",
        qualification: "MS (Master of Surgery)"
    },
    {
        doc_id: "DO-8500282",
        full_name: "Rohan Singh",
        email: "rohan.singh@example.com",
        contact_number: "+91-9876543212",
        dob: "1977-02-16",
        age: 47,
        gender: "Male",
        address: "19th Floor, Banjara Hills, Hyderabad",
        pincode: 500034,
        specialty: "Orthopedics",
        experience: 25,
        username: "rohan.singh",
        password: "qK0)iEbO)5n9z(",
        status: "Online",
        qualification: "MBBS (Bachelor of Medicine, Bachelor of Surgery)"
    },
    {
        doc_id: "DO-4434571",
        full_name: "Anita Chatterjee",
        email: "anita.chatterjee@example.com",
        contact_number: "+91-9876543213",
        dob: "1975-03-18",
        age: 49,
        gender: "Female",
        address: "Suite 30, Salt Lake, Kolkata",
        pincode: 700091,
        specialty: "Pediatrics",
        experience: 20,
        username: "anita.chatterjee",
        password: "wZ8@KPxG<!&mq",
        status: "Offline",
        qualification: "DNB (Diplomate of National Board)"
    },
    {
        doc_id: "DO-3663647",
        full_name: "Ishaan Bhatt",
        email: "ishaan.bhatt@example.com",
        contact_number: "+91-9876543214",
        dob: "1983-05-19",
        age: 41,
        gender: "Male",
        address: "PO Box 3224, Vasant Kunj, Delhi",
        pincode: 110070,
        specialty: "Dermatology",
        experience: 18,
        username: "ishaan.bhatt",
        password: "tH4+\"_SYvKq6Q",
        status: "Online",
        qualification: "DM (Doctorate of Medicine)"
    }
];

Doctor.insertMany(doctorData).then(() => {
    console.log("Doctors inserted successfully");
}).catch(err => {
    console.log("Error inserting doctors:", err);
});


//Appointments Data
const appointmentData = [
    {
        app_id: "app-398457",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        contact: "+91-9876543215",
        dob: "1985-07-08",
        age: 38,
        gender: "Male",
        address: "Flat No. 204, Akash Ganga Apartments, Andheri West, Mumbai",
        pincode: "400053",
        app_doc: "Ishaan Bhatt",
        app_date: "2023-09-16 01:20",
        reason: "prenatal visit",
        notes: "Ensure all prenatal checks are completed.",
        status: "Completed"
    },
    {
        app_id: "app-872648",
        name: "Sneha Reddy",
        email: "sneha.reddy@example.com",
        contact: "+91-9876543216",
        dob: "1986-12-10",
        age: 37,
        gender: "Female",
        address: "Plot No. 56, Jubilee Hills, Hyderabad",
        pincode: "500033",
        app_doc: "Aarav Mehta",
        app_date: "2024-04-29 17:31",
        reason: "prenatal visit",
        notes: "Review pregnancy progress and provide advice.",
        status: "Pending"
    },
    {
        app_id: "app-569734",
        name: "Kiran Patel",
        email: "kiran.patel@example.com",
        contact: "+91-9876543217",
        dob: "1991-11-08",
        age: 32,
        gender: "Female",
        address: "22, MG Road, Bangalore",
        pincode: "560001",
        app_doc: "Maya Iyer",
        app_date: "2023-09-20 07:52",
        reason: "annual check-up",
        notes: "Conduct a full health check-up.",
        status: "Cancelled"
    },
    {
        app_id: "app-672538",
        name: "Ankit Das",
        email: "ankit.das@example.com",
        contact: "+91-9876543218",
        dob: "2003-05-08",
        age: 21,
        gender: "Male",
        address: "15/3, Park Street, Kolkata",
        pincode: "700016",
        app_doc: "Anita Chatterjee",
        app_date: "2023-07-04 10:53",
        reason: "annual check-up",
        notes: "Review general health and lifestyle.",
        status: "Completed"
    },
    {
        app_id: "app-129475",
        name: "Pooja Singh",
        email: "pooja.singh@example.com",
        contact: "+91-9876543219",
        dob: "1952-09-03",
        age: 72,
        gender: "Female",
        address: "3rd Floor, Lajpat Nagar, New Delhi",
        pincode: "110024",
        app_doc: "Ishaan Bhatt",
        app_date: "2024-01-10 05:22",
        reason: "annual check-up",
        notes: "Complete routine physical examination.",
        status: "Pending"
    },
    {
        app_id: "app-345789",
        name: "Amit Verma",
        email: "amit.verma@example.com",
        contact: "+91-9876543220",
        dob: "1994-11-01",
        age: 29,
        gender: "Male",
        address: "12, Brigade Road, Bangalore",
        pincode: "560025",
        app_doc: "Ishaan Bhatt",
        app_date: "2023-11-27 19:20",
        reason: "prenatal visit",
        notes: "Follow-up on prenatal care.",
        status: "Cancelled"
    },
    {
        app_id: "app-456789",
        name: "Ravi Kumar",
        email: "ravi.kumar@example.com",
        contact: "+91-9876543221",
        dob: "1948-05-03",
        age: 75,
        gender: "Male",
        address: "H.No. 34, Sector 14, Gurgaon",
        pincode: "122001",
        app_doc: "Anita Chatterjee",
        app_date: "2023-09-11 18:20",
        reason: "vaccination",
        notes: "Administer scheduled vaccination.",
        status: "Completed"
    },
    {
        app_id: "app-987654",
        name: "Suman Joshi",
        email: "suman.joshi@example.com",
        contact: "+91-9876543222",
        dob: "1920-11-21",
        age: 103,
        gender: "Female",
        address: "23, Marine Drive, Mumbai",
        pincode: "400002",
        app_doc: "Maya Iyer",
        app_date: "2024-02-16 14:30",
        reason: "physical therapy",
        notes: "Assess and provide physical therapy.",
        status: "Pending"
    }
];

Appointment.insertMany(appointmentData).then(() => {
    console.log("Appointments inserted successfully");
}).catch(err => {
    console.log("Error inserting appointments:", err);
});


//Employee data
const employeeData = [
    {
        employee_id: "EM-6556967",
        full_name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        contact_number: "+91-9876543230",
        date_of_birth: "1985-11-05",
        age: 38,
        gender: "Male",
        address: "4 Chive Pass, Sector 15, Noida",
        pincode: "201301",
        department: "Administration",
        position: "HR Manager",
        salary: 80098.00,
        qualification: "Post Graduate",
        experience: 15
    },
    {
        employee_id: "EM-1421487",
        full_name: "Pooja Nair",
        email: "pooja.nair@example.com",
        contact_number: "+91-9876543231",
        date_of_birth: "1988-02-18",
        age: 36,
        gender: "Female",
        address: "47965 Troy Junction, Aluva, Kochi",
        pincode: "683101",
        department: "Nursing",
        position: "Senior Nurse",
        salary: 50435.00,
        qualification: "Graduate",
        experience: 12
    },
    {
        employee_id: "EM-8645582",
        full_name: "Shreya Patel",
        email: "shreya.patel@example.com",
        contact_number: "+91-9876543232",
        date_of_birth: "1990-10-02",
        age: 33,
        gender: "Female",
        address: "1 Havey Crossing, Vastrapur, Ahmedabad",
        pincode: "380015",
        department: "Pharmacy",
        position: "Pharmacist",
        salary: 45254.00,
        qualification: "Graduate",
        experience: 10
    },
    {
        employee_id: "EM-1900898",
        full_name: "Anil Kumar",
        email: "anil.kumar@example.com",
        contact_number: "+91-9876543233",
        date_of_birth: "1960-11-26",
        age: 63,
        gender: "Male",
        address: "43244 Corscot Trail, Rajouri Garden, Delhi",
        pincode: "110027",
        department: "Maintenance and Housekeeping",
        position: "Maintenance Supervisor",
        salary: 35220.00,
        qualification: "12th Pass",
        experience: 30
    },
    {
        employee_id: "EM-2617337",
        full_name: "Divya Singh",
        email: "divya.singh@example.com",
        contact_number: "+91-9876543234",
        date_of_birth: "1978-01-27",
        age: 46,
        gender: "Female",
        address: "5 Porter Avenue, Indira Nagar, Lucknow",
        pincode: "226016",
        department: "Medical Records",
        position: "Records Manager",
        salary: 55057.00,
        qualification: "Graduate",
        experience: 20
    },
    {
        employee_id: "EM-4151087",
        full_name: "Vikas Gupta",
        email: "vikas.gupta@example.com",
        contact_number: "+91-9876543235",
        date_of_birth: "1988-01-28",
        age: 36,
        gender: "Male",
        address: "46 Artisan Court, Mylapore, Chennai",
        pincode: "600004",
        department: "Laboratory",
        position: "Lab Technician",
        salary: 40365.00,
        qualification: "Diploma or Equivalent",
        experience: 8
    }
];

Employee.insertMany(employeeData).then(() => {
    console.log("Employees inserted successfully");
}).catch(err => {
    console.log("Error inserting employees:", err);
});


//Lab Report Data

const labData = [
    {
        "patient_id": "PA-39-9940859",
        "name": "Amit Kumar",
        "ailment": "insomnia",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Polysomnography (Sleep Study),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Actigraphy,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Urine Tests</li></ol>",
        "lab_results": "['Mild sleep apnea detected', 'Irregular sleep patterns observed', 'Normal', 'Normal']",
        "heart_rate": 72,
        "blood_pressure": "120/80",
        "temperature": 98.6,
        "resp_rate": 16,
        "oxygen_sat": 98
    },
    {
        "patient_id": "PA-82-7040026",
        "name": "Sita Sharma",
        "ailment": "fatigue",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Thyroid Function Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Glucose Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Electrolyte Panel</li></ol>",
        "lab_results": "['Anemia detected', 'Normal', 'Normal', 'Normal']",
        "heart_rate": 78,
        "blood_pressure": "115/75",
        "temperature": 98.4,
        "resp_rate": 18,
        "oxygen_sat": 97
    },
    {
        "patient_id": "PA-51-5583244",
        "name": "Ravi Verma",
        "ailment": "allergies",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Allergy Skin Tests</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>IgE Antibody Blood Test</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC)</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Nasal Smear</li></ol>",
        "lab_results": "['Positive for pollen and dust mites', 'Elevated IgE levels', 'Normal', 'Eosinophils present']",
        "heart_rate": 76,
        "blood_pressure": "118/78",
        "temperature": 98.6,
        "resp_rate": 16,
        "oxygen_sat": 98
    },
    {
        "patient_id": "PA-30-0417402",
        "name": "Lakshmi Nair",
        "ailment": "sore throat",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Throat Swab Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Rapid Strep Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Monospot Test</li></ol>",
        "lab_results": "['Streptococcus pyogenes detected', 'Positive', 'Elevated white blood cells', 'Negative']",
        "heart_rate": 82,
        "blood_pressure": "122/80",
        "temperature": 99.1,
        "resp_rate": 18,
        "oxygen_sat": 96
    },
    {
        "patient_id": "PA-95-0067684",
        "name": "Ramesh Gupta",
        "ailment": "allergies",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Allergy Skin Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>IgE Antibody Blood Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Nasal Smear</li></ol>",
        "lab_results": "['Positive for pollen and dust mites', 'Elevated IgE levels', 'Normal', 'Eosinophils present']",
        "heart_rate": 75,
        "blood_pressure": "120/80",
        "temperature": 98.6,
        "resp_rate": 16,
        "oxygen_sat": 98
    },
    {
        "patient_id": "PA-04-7961598",
        "name": "Anita Singh",
        "ailment": "allergies",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Allergy Skin Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>IgE Antibody Blood Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Nasal Smear</li></ol>",
        "lab_results": "['Positive for pollen and dust mites', 'Elevated IgE levels', 'Normal', 'Eosinophils present']",
        "heart_rate": 74,
        "blood_pressure": "118/78",
        "temperature": 98.5,
        "resp_rate": 16,
        "oxygen_sat": 98
    },
    {
        "patient_id": "PA-83-4918209",
        "name": "Kavita Joshi",
        "ailment": "headache",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Magnetic Resonance Imaging (MRI),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Computed Tomography (CT) Scan,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Tests,</li><li data-list=\"ordered\"><<span class=\"ql-ui\" contenteditable=\"false\"></span>Eye Exam</li></ol>",
        "lab_results": "['No abnormalities detected', 'No abnormalities detected', 'Normal', 'Normal']",
        "heart_rate": 80,
        "blood_pressure": "120/80",
        "temperature": 98.6,
        "resp_rate": 16,
        "oxygen_sat": 98
    },
    {
        "patient_id": "PA-28-8523048",
        "name": "Manoj Patel",
        "ailment": "sore throat",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Throat Swab Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Rapid Strep Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Monospot Test</li></ol>",
        "lab_results": "['Streptococcus pyogenes detected', 'Positive', 'Elevated white blood cells', 'Negative']",
        "heart_rate": 85,
        "blood_pressure": "122/82",
        "temperature": 99.0,
        "resp_rate": 18,
        "oxygen_sat": 96
    },
    {
        "patient_id": "PA-55-7237124",
        "name": "Bharat Desai",
        "ailment": "fever",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Urinalysis,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Chest X-Ray</li></ol>",
        "lab_results": "['Elevated white blood cells', 'No growth', 'Normal', 'Normal']",
        "heart_rate": 90,
        "blood_pressure": "118/76",
        "temperature": 100.4,
        "resp_rate": 20,
        "oxygen_sat": 95
    },
    {
        "patient_id": "PA-77-9181409",
        "name": "Geeta Mehta",
        "ailment": "sore throat",
        "lab_tests": "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Throat Swab Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Rapid Strep Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Monospot Test</li></ol>",
        "lab_results": "['Streptococcus pyogenes detected', 'Positive', 'Elevated white blood cells', 'Negative']",
        "heart_rate": 84,
        "blood_pressure": "120/80",
        "temperature": 99.2,
        "resp_rate": 18,
        "oxygen_sat": 96
    }
];

LabReport.insertMany(labData).then(() => {
    console.log("Lab Data inserted successfully");
}).catch(err => {
    console.log("Error inserting employees:", err);
});


//Patient Data
const patientData = [
    {
        "patient_id": "PA-39-9940859",
        "name": "Amit Kumar",
        "email": "amit.kumar@example.com",
        "dob": new Date("1987-03-15"),
        "age": 37,
        "gender": "Male",
        "contact": "+91-9876543210",
        "emergency_contact": "+91-9876543211",
        "address": "009 Crest Line Road, Vasant Kunj, New Delhi",
        "marital_status": "Married",
        "ailment": "insomnia",
        "type": "Out-patient",
        "doc_assign": "Rohan Singh",
        "treat_status": "Ongoing"
    },
    {
        "patient_id": "PA-82-7040026",
        "name": "Sita Sharma",
        "email": "sita.sharma@example.com",
        "dob": new Date("1960-11-01"),
        "age": 63,
        "gender": "Female",
        "contact": "+91-9876543212",
        "emergency_contact": "+91-9876543213",
        "address": "1 Pepper Wood Court, Bandra, Mumbai",
        "marital_status": "Widowed",
        "ailment": "fatigue",
        "type": "In-patient",
        "doc_assign": "Maya Iyer",
        "treat_status": "Completed"
    },
    {
        "patient_id": "PA-51-5583244",
        "name": "Ravi Verma",
        "email": "ravi.verma@example.com",
        "dob": new Date("1980-05-23"),
        "age": 43,
        "gender": "Male",
        "contact": "+91-9876543214",
        "emergency_contact": "+91-9876543215",
        "address": "3732 Monica Plaza, Indiranagar, Bangalore",
        "marital_status": "Divorced",
        "ailment": "allergies",
        "type": "Out-patient",
        "doc_assign": "Rohan Singh",
        "treat_status": "Ongoing"
    },
    {
        "patient_id": "PA-30-0417402",
        "name": "Lakshmi Nair",
        "email": "lakshmi.nair@example.com",
        "dob": new Date("1975-08-31"),
        "age": 48,
        "gender": "Female",
        "contact": "+91-9876543216",
        "emergency_contact": "+91-9876543217",
        "address": "4361 Londonderry Hill, Palarivattom, Kochi",
        "marital_status": "Single",
        "ailment": "sore throat",
        "type": "In-patient",
        "doc_assign": "Maya Iyer",
        "treat_status": "Completed"
    },
    {
        "patient_id": "PA-95-0067684",
        "name": "Ramesh Gupta",
        "email": "ramesh.gupta@example.com",
        "dob": new Date("1984-05-08"),
        "age": 40,
        "gender": "Male",
        "contact": "+91-9876543218",
        "emergency_contact": "+91-9876543219",
        "address": "440 Loftsgordon Avenue, Banjara Hills, Hyderabad",
        "marital_status": "Single",
        "ailment": "allergies",
        "type": "Out-patient",
        "doc_assign": "Aarav Mehta",
        "treat_status": "Completed"
    },
    {
        "patient_id": "PA-04-7961598",
        "name": "Anita Singh",
        "email": "anita.singh@example.com",
        "dob": new Date("1995-12-27"),
        "age": 28,
        "gender": "Female",
        "contact": "+91-9876543220",
        "emergency_contact": "+91-9876543221",
        "address": "7482 Anthes Point, Gomti Nagar, Lucknow",
        "marital_status": "Single",
        "ailment": "allergies",
        "type": "In-patient",
        "doc_assign": "Ishaan Bhatt",
        "treat_status": "Ongoing"
    },
    {
        "patient_id": "PA-83-4918209",
        "name": "Kavita Joshi",
        "email": "kavita.joshi@example.com",
        "dob": new Date("1973-10-31"),
        "age": 50,
        "gender": "Female",
        "contact": "+91-9876543222",
        "emergency_contact": "+91-9876543223",
        "address": "53315 Anhalt Court, JP Nagar, Bangalore",
        "marital_status": "Divorced",
        "ailment": "headache",
        "type": "Out-patient",
        "doc_assign": "Ishaan Bhatt",
        "treat_status": "Ongoing"
    },
    {
        "patient_id": "PA-28-8523048",
        "name": "Manoj Patel",
        "email": "manoj.patel@example.com",
        "dob": new Date("1968-08-15"),
        "age": 55,
        "gender": "Male",
        "contact": "+91-9876543224",
        "emergency_contact": "+91-9876543225",
        "address": "7701 Michigan Park, Ellis Bridge, Ahmedabad",
        "marital_status": "Married",
        "ailment": "sore throat",
        "type": "In-patient",
        "doc_assign": "Anita Chatterjee",
        "treat_status": "Completed"
    },
    {
        "patient_id": "PA-55-7237124",
        "name": "Bharat Desai",
        "email": "bharat.desai@example.com",
        "dob": new Date("1980-10-23"),
        "age": 43,
        "gender": "Male",
        "contact": "+91-9876543226",
        "emergency_contact": "+91-9876543227",
        "address": "5938 Ryan Court, Salt Lake, Kolkata",
        "marital_status": "Married",
        "ailment": "fever",
        "type": "Out-patient",
        "doc_assign": "Aarav Mehta",
        "treat_status": "Ongoing"
    },
    {
        "patient_id": "PA-77-9181409",
        "name": "Geeta Mehta",
        "email": "geeta.mehta@example.com",
        "dob": new Date("1965-09-25"),
        "age": 58,
        "gender": "Female",
        "contact": "+91-9876543228",
        "emergency_contact": "+91-9876543229",
        "address": "53745 Prairieview Court, Vile Parle, Mumbai",
        "marital_status": "Divorced",
        "ailment": "sore throat",
        "type": "In-patient",
        "doc_assign": "Anita Chatterjee",
        "treat_status": "Completed"
    }
];

Patient.insertMany(patientData).then(() => {
    console.log("Patient Data inserted successfully");
}).catch(err => {
    console.log("Error inserting Patients:", err);
})


//Prescription Data
const prescriptionData = [
    {
        "patient_id": "PA-39-9940859",
        "name": "Amit Kumar",
        "ailment": "insomnia",
        "notes": "Prescribed 10mg Zolpidem tablets to be taken once daily at bedtime. Recommended sleep hygiene practices including maintaining a regular sleep schedule. Advised to avoid caffeine and heavy meals before bedtime. Suggested relaxation techniques such as meditation or a warm bath before bed. Follow-up in two weeks to assess effectiveness and make any necessary adjustments."
    },
    {
        "patient_id": "PA-82-7040026",
        "name": "Sita Sharma",
        "ailment": "fatigue",
        "notes": "Advised daily multivitamin supplements and a balanced diet rich in iron. Recommended regular light exercise, such as walking for 30 minutes a day. Encouraged to maintain a consistent sleep schedule and practice good sleep hygiene. Suggested reducing stress through activities like yoga or meditation. Follow-up in one month to monitor energy levels and overall well-being."
    },
    {
        "patient_id": "PA-51-5583244",
        "name": "Ravi Verma",
        "ailment": "allergies",
        "notes": "Prescribed 5mg Levocetirizine tablets once daily for allergy relief. Advised to avoid known allergens and keep windows closed during high pollen days. Recommended using an air purifier to reduce indoor allergens. Suggested saline nasal spray for nasal congestion relief. Follow-up if symptoms persist or worsen to reassess treatment plan."
    },
    {
        "patient_id": "PA-30-0417402",
        "name": "Lakshmi Nair",
        "ailment": "sore throat",
        "notes": "Prescribed 500mg Amoxicillin tablets to be taken thrice daily for 7 days. Advised to stay hydrated and use throat lozenges to soothe throat irritation. Recommended gargling with warm salt water several times a day. Suggested avoiding irritants such as smoking and alcohol. Follow-up if no improvement or if symptoms worsen within a week."
    },
    {
        "patient_id": "PA-95-0067684",
        "name": "Ramesh Gupta",
        "ailment": "allergies",
        "notes": "Prescribed 5mg Loratadine tablets once daily for allergy symptom relief. Advised to use saline nasal spray as needed to clear nasal passages. Recommended keeping windows closed during high pollen days to minimize exposure. Suggested washing bedding frequently to reduce dust mites. Follow-up if symptoms do not improve or if new symptoms develop."
    },
    {
        "patient_id": "PA-04-7961598",
        "name": "Anita Singh",
        "ailment": "allergies",
        "notes": "Prescribed 10mg Cetirizine tablets once daily to manage allergy symptoms. Advised to keep windows closed during high pollen periods and use an air purifier. Recommended washing clothes and showering after being outdoors. Suggested using a humidifier to maintain optimal indoor humidity levels. Follow-up if symptoms persist or if any side effects occur."
    },
    {
        "patient_id": "PA-83-4918209",
        "name": "Kavita Joshi",
        "ailment": "headache",
        "notes": "Prescribed 500mg Paracetamol tablets to be taken as needed for pain relief. Recommended stress management techniques such as deep breathing exercises. Advised to maintain a regular sleep schedule and avoid triggers like certain foods. Suggested hydration and regular meals to prevent headache onset. Follow-up if headaches continue or if they become more severe."
    },
    {
        "patient_id": "PA-28-8523048",
        "name": "Manoj Patel",
        "ailment": "sore throat",
        "notes": "Prescribed 250mg Erythromycin tablets to be taken thrice daily for 7 days. Advised to rest and drink warm fluids like herbal tea with honey. Recommended using throat lozenges or sprays to soothe irritation. Suggested avoiding irritants such as smoke and strong odors. Follow-up if no improvement or if symptoms worsen within a week."
    },
    {
        "patient_id": "PA-55-7237124",
        "name": "Bharat Desai",
        "ailment": "fever",
        "notes": "Prescribed 500mg Paracetamol tablets to be taken every 6 hours to reduce fever. Advised to stay hydrated by drinking plenty of fluids. Recommended rest and avoiding strenuous activities until fever subsides. Suggested using a cool compress to alleviate discomfort. Follow-up if fever persists for more than 3 days or if symptoms worsen."
    },
    {
        "patient_id": "PA-77-9181409",
        "name": "Geeta Mehta",
        "ailment": "sore throat",
        "notes": "Prescribed 500mg Azithromycin tablets to be taken once daily for 3 days. Advised to gargle with warm salt water several times a day to reduce throat pain. Recommended staying hydrated and drinking warm fluids. Suggested avoiding irritants such as smoking and alcohol. Follow-up if symptoms do not improve or if they worsen."
    }
];


Prescription.insertMany(prescriptionData).then(() => {
    console.log("Prescription Data inserted successfully");
}).catch(err => { console.log("Error inserting Prescription:", err) });


//Pharmacy Data
const pharmacyData = [
    {
        "name": "Diphtheria Vaccine",
        "quantity": 120,
        "category": "Vaccines",
        "vendor": "PharmaGlobe",
        "barcode_number": "8901234567890",
        "description": "Used to prevent diphtheria, tetanus, and pertussis (whooping cough). Store in a cool, dry place."
    },
    {
        "name": "Cefixime",
        "quantity": 180,
        "category": "Antibiotics",
        "vendor": "PharmaGlobe",
        "barcode_number": "8909876543210",
        "description": "An antibiotic used to treat a wide variety of bacterial infections. Consult your doctor before use."
    },
    {
        "name": "Paracetamol",
        "quantity": 150,
        "category": "Analgesics",
        "vendor": "MedVista Pharmaceuticals",
        "barcode_number": "8904567890123",
        "description": "Commonly used to reduce fever and relieve mild to moderate pain."
    },
    {
        "name": "Levothyroxine",
        "quantity": 200,
        "category": "Hormonal medications",
        "vendor": "Apex Pharma Solutions",
        "barcode_number": "8903210987654",
        "description": "A medication prescribed for thyroid hormone replacement therapy."
    },
    {
        "name": "BCG Vaccine",
        "quantity": 190,
        "category": "Vaccines",
        "vendor": "PharmaGlobe",
        "barcode_number": "8909876543201",
        "description": "A vaccine primarily used against tuberculosis. Store under recommended conditions."
    },
    {
        "name": "Azithromycin",
        "quantity": 170,
        "category": "Antibiotics",
        "vendor": "PharmaSolutions",
        "barcode_number": "8906543210987",
        "description": "An antibiotic used for treating various types of bacterial infections, including respiratory infections."
    },
    {
        "name": "Ibuprofen",
        "quantity": 130,
        "category": "Analgesics",
        "vendor": "PharmaSolutions",
        "barcode_number": "8900987654321",
        "description": "Used for relief from pain, inflammation, and fever. Follow the dosage instructions."
    },
    {
        "name": "Insulin Glargine",
        "quantity": 160,
        "category": "Hormonal medications",
        "vendor": "PharmaSolutions",
        "barcode_number": "8905678901234",
        "description": "A long-acting insulin used to treat diabetes. Ensure proper storage as per instructions."
    },
    {
        "name": "Atorvastatin",
        "quantity": 140,
        "category": "Hormonal medications",
        "vendor": "Apex Pharma Solutions",
        "barcode_number": "8902345678901",
        "description": "Used to lower cholesterol and reduce the risk of heart disease."
    },
    {
        "name": "Diclofenac",
        "quantity": 115,
        "category": "Analgesics",
        "vendor": "MedVista Pharmaceuticals",
        "barcode_number": "8903456789012",
        "description": "Used to relieve pain and inflammation in conditions such as arthritis."
    }
];

Pharmacy.insertMany(pharmacyData).then(() => {
    console.log("Prescription Data inserted successfully");
}).catch(err => { console.log("Error inserting Pharmacy:", err) });


