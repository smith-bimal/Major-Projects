require("dotenv").config();

const mongoose = require('mongoose');
const Admin = require('./src/models/adminModel');
const Doctor = require('./src/models/docModel');
const Appointment = require('./src/models/appointmentModel');
const Employee = require('./src/models/employeeModel');
const LabReport = require('./src/models/labModel');
const Patient = require('./src/models/patientModel');
const Prescription = require('./src/models/prescriptionModel');
const Pharmacy = require('./src/models/pharmacyModel');
const Payroll = require('./src/models/payrollModel');

main()
console.log("Connected to database");

async function main() {
    // await mongoose.connect('mongodb://127.0.0.1:27017/hms_database');
    await mongoose.connect(process.env.ATLASDB_URL);
};

//Admin data
const adminData = [
    {
        name: "System Admin",
        email: "admin@example.com",
        username: "admin",
        password: "$2b$10$qWmsivd5b8rHjEfuuSEs1ubK9LNO7tMmkLRdZevcQdAKAc1DyiRi2"
    }
];

//Doctor Data
const doctorData = [
    {
        _id: '665f1d35035b109914313b9f',
        doc_id: 'DO-4640764',
        full_name: 'Maya Iyer',
        email: 'maya.iyer@hms.com',
        contact_number: '+91-9876543211',
        dob: new Date('1985-02-06T00:00:00.000Z'),
        gender: 'Female',
        address: 'Apt 1384, Koramangala, Bangalore',
        pincode: 560034,
        specialty: 'Neurology',
        experience: 15,
        username: 'maya.iyer',
        password: '$2b$10$BSzeeodBtPRXouns23lj/.4MjamljsrezV3Xx/X9f1w4z6z5/O8ni',
        status: 'Offline',
        qualification: 'MS (Master of Surgery)',
        bio: 'I am a dedicated Neurologist with a passion for improving patient outcomes. I am known for my empathetic approach and commitment to providing high-quality care. In my free time, I enjoy reading, hiking, and volunteering at local community events.',
        __v: 0,
        notes: 'Specializes in treating epilepsy, Parkinson\'s disease, and multiple sclerosis.\r\nFluent in English, Hindi, and Tamil.\r\nActively participates in neurology conferences and has published several research papers.',
        avatar: 'doc-2.jpg'
    },
    {
        _id: '665f1d35035b109914313ba0',
        doc_id: 'DO-8500282',
        full_name: 'Rohan Singh',
        email: 'rohan.singh@hms.com',
        contact_number: '+91-9876543212',
        dob: new Date('1977-02-16T00:00:00.000Z'),
        gender: 'Male',
        address: '19th Floor, Banjara Hills, Hyderabad',
        pincode: 500034,
        specialty: 'Orthopedics',
        experience: 25,
        username: 'rohan.singh',
        password: '$2b$10$TQ5QzAv/BQ2Q41TV/ZmdF.C0lIojoq/R64R4If8dFu1QtGyzy6.U6',
        status: 'Offline',
        qualification: 'MBBS (Bachelor of Medicine, Bachelor of Surgery)',
        bio: 'I am a skilled Orthopedic surgeon known for my expertise in complex orthopedic procedures. I am committed to staying updated with the latest advancements in orthopedic surgery to ensure the best possible outcomes for my patients. Outside of work, I enjoy playing tennis and spending time with my family.',
        __v: 0,
        avatar: 'doc-4.jpg',
        notes: 'Expertise in knee and hip replacement surgeries.\r\nFluent in English, Hindi, and Punjabi.\r\nMember of the Indian Orthopedic Association and the International Society for Orthopedic Surgery and Traumatology.'
    },
    {
        _id: '665f1d35035b109914313ba1',
        doc_id: 'DO-4434571',
        full_name: 'Anita Chatterjee',
        email: 'anita.chatterjee@hms.com',
        contact_number: '+91-9876543213',
        dob: new Date('1975-03-18T00:00:00.000Z'),
        gender: 'Female',
        address: 'Suite 30, Salt Lake, Kolkata',
        pincode: 700091,
        specialty: 'Pediatrics',
        experience: 20,
        username: 'anita.chatterjee',
        password: '$2b$10$cnf0y22sp5CAzqdE.XhuMuaaiwG06J6QKRNaki8p063Wa7XWSn1iK',
        status: 'Offline',
        qualification: 'DNB (Diplomate of National Board)',
        bio: ' I am a compassionate Pediatrician with a focus on preventive care and early childhood development. I am dedicated to creating a comfortable and friendly environment for my young patients. In my spare time, I enjoy painting, gardening, and exploring new cuisines.',
        __v: 0,
        notes: 'Specializes in pediatric infectious diseases and developmental disorders.\r\nFluent in English, Bengali, and Hindi.\r\nRegularly conducts health camps for underprivileged children and is involved in child health advocacy.',
        avatar: 'test-1 (4).jpg'
    },
    {
        _id: '665f1d35035b109914313ba2',
        doc_id: 'DO-3663647',
        full_name: 'Ishaan Bhatt',
        email: 'ishaan.bhatt@hms.com',
        contact_number: '+91-9876543214',
        dob: new Date('1983-05-19T00:00:00.000Z'),
        gender: 'Male',
        address: 'PO Box 3224, Vasant Kunj, Delhi',
        pincode: 110070,
        specialty: 'Dermatology',
        experience: 18,
        username: 'ishaan.bhatt',
        password: '$2b$10$I1B7uGLZayoNEqbR9I95O.yLD/WHZ9CF/mD1mfpEvRWFQJCOuvXBK',
        status: 'Offline',
        qualification: 'DM (Doctorate of Medicine)',
        bio: 'I am a knowledgeable Dermatologist known for my expertise in diagnosing and treating skin conditions. I am passionate about helping my patients achieve healthy and glowing skin. Outside of work, I enjoy traveling, photography, and playing the guitar.',
        __v: 0,
        notes: 'Specializes in pediatric infectious diseases and developmental disorders.\r\nFluent in English, Bengali, and Hindi.\r\nRegularly conducts health camps for underprivileged children and is involved in child health advocacy.',
        avatar: 'doc-5.jpg'
    }

];

//Appointments Data
const appointmentData = [
    {
        _id: "665f1d35035b109914313ba3",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        contact: "+91-9876543215",
        dob: new Date("1985-07-08T00:00:00.000Z"),
        age: 38,
        gender: "Male",
        address: "Flat No. 204, Akash Ganga Apartments, Andheri West, Mumbai",
        pincode: "400053",
        app_doc: "Ishaan Bhatt",
        app_date: new Date("2023-09-15T14:20:00.000Z"),
        reason: "prenatal visit",
        notes: "Rahul Sharma attended his prenatal visit on 16th September 2023. The appointment was completed successfully, and all necessary checks were performed. Rahul's health parameters were within normal ranges, and no immediate concerns were noted. Follow-up visits have been scheduled as per the standard prenatal care protocol.",
        status: "Completed",
        __v: 0
    },
    {
        _id: "665f1d35035b109914313ba4",
        name: "Sneha Reddy",
        email: "sneha.reddy@example.com",
        contact: "+91-9876543216",
        dob: new Date("1986-12-10T00:00:00.000Z"),
        age: 37,
        gender: "Female",
        address: "Plot No. 56, Jubilee Hills, Hyderabad",
        pincode: "500033",
        app_doc: "Aarav Mehta",
        app_date: new Date("2024-04-29T06:31:00.000Z"),
        reason: "prenatal visit",
        notes: "Sneha Reddy has an upcoming prenatal visit scheduled for 29th April 2024. This visit will include routine check-ups, ultrasound, and any necessary blood tests to monitor the progress of her pregnancy. It is important for Sneha to follow the preparation guidelines provided and arrive on time for the appointment.",
        status: "Pending",
        __v: 0
    },
    {
        _id: "665f1d35035b109914313ba5",
        name: "Kiran Patel",
        email: "kiran.patel@example.com",
        contact: "+91-9876543217",
        dob: new Date("1991-11-08T00:00:00.000Z"),
        age: 32,
        gender: "Female",
        address: "22, MG Road, Bangalore",
        pincode: "560001",
        app_doc: "Maya Iyer",
        app_date: new Date("2023-09-19T20:52:00.000Z"),
        reason: "annual check-up",
        notes: "Kiran Patel's annual check-up scheduled for 20th September 2023 was cancelled. The appointment needs to be rescheduled to ensure that Kiran receives her routine health assessment and preventive care services. She is advised to contact the clinic to set up a new appointment date.",
        status: "Cancelled",
        __v: 0
    },
    {
        _id: "665f1d35035b109914313ba6",
        name: "Ankit Das",
        email: "ankit.das@example.com",
        contact: "+91-9876543218",
        dob: new Date("2003-05-08T00:00:00.000Z"),
        age: 21,
        gender: "Male",
        address: "15/3, Park Street, Kolkata",
        pincode: "700016",
        app_doc: "Anita Chatterjee",
        app_date: new Date("2023-07-03T23:53:00.000Z"),
        reason: "annual check-up",
        notes: "Ankit Das successfully completed his annual check-up on 4th July 2023. The examination covered all standard health checks, and his overall health status was found to be satisfactory. No major health issues were detected, and Ankit was advised to maintain a healthy lifestyle and return for his next annual check-up in one year.",
        status: "Completed",
        __v: 0
    },
    {
        _id: "665f1d35035b109914313ba7",
        name: "Pooja Singh",
        email: "pooja.singh@example.com",
        contact: "+91-9876543219",
        dob: new Date(-546825600000),
        age: 72,
        gender: "Female",
        address: "3rd Floor, Lajpat Nagar, New Delhi",
        pincode: "110024",
        app_doc: "Ishaan Bhatt",
        app_date: new Date("2024-01-09T18:22:00.000Z"),
        reason: "annual check-up",
        notes: "Pooja Singh has an annual check-up appointment pending on 10th January 2024. This visit will include a comprehensive health assessment to monitor her well-being and manage any chronic conditions. It is crucial for Pooja to attend this check-up to ensure her health is being appropriately managed.",
        status: "Pending",
        __v: 0
    },
    {
        _id: "665f1d35035b109914313ba8",
        name: "Amit Verma",
        email: "amit.verma@example.com",
        contact: "+91-9876543220",
        dob: new Date("1994-11-01T00:00:00.000Z"),
        age: 29,
        gender: "Male",
        address: "12, Brigade Road, Bangalore",
        pincode: "560025",
        app_doc: "Ishaan Bhatt",
        app_date: new Date("2023-11-27T08:20:00.000Z"),
        reason: "prenatal visit",
        notes: "Amit Verma's prenatal visit scheduled for 27th November 2023 was cancelled. Rescheduling is necessary to ensure continuity of care and to address any concerns related to his prenatal health. Amit should contact the clinic as soon as possible to set a new appointment date.",
        status: "Cancelled",
        __v: 0
    },
    {
        _id: "665f1d35035b109914313ba9",
        name: "Ravi Kumar",
        email: "ravi.kumar@example.com",
        contact: "+91-9876543221",
        dob: new Date(-683683200000),
        age: 75,
        gender: "Male",
        address: "H.No. 34, Sector 14, Gurgaon",
        pincode: "122001",
        app_doc: "Anita Chatterjee",
        app_date: new Date("2023-09-11T07:20:00.000Z"),
        reason: "vaccination",
        notes: "Ravi Kumar received his scheduled vaccination on 11th September 2023. The procedure was completed without any complications. Ravi is advised to monitor for any post-vaccination symptoms and report any unusual reactions to the healthcare provider. His vaccination records have been updated accordingly.",
        status: "Completed",
        __v: 0
    },
    {
        _id: "665f1d35035b109914313baa",
        name: "Suman Joshi",
        email: "suman.joshi@example.com",
        contact: "+91-9876543222",
        dob: new Date(-1549843200000),
        age: 103,
        gender: "Female",
        address: "23, Marine Drive, Mumbai",
        pincode: "400002",
        app_doc: "Maya Iyer",
        app_date: new Date("2024-02-16T03:30:00.000Z"),
        reason: "physical therapy",
        notes: "Suman Joshi has a physical therapy session scheduled for 16th February 2024. This session aims to improve her mobility and manage any musculoskeletal issues. It is important for Suman to attend this appointment to enhance her quality of life and maintain her physical health.",
        status: "Pending",
        __v: 0
    }
];

//Employee data
const employeeData = [
    {

        employee_id: "EM-6556967",
        full_name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        contact_number: "+91-9876543230",
        date_of_birth: "1985-11-05T00:00:00.000Z",
        age: 38,
        gender: "Male",
        address: "4 Chive Pass, Sector 15, Noida",
        pincode: "201301",
        department: "Administration",
        position: "HR Manager",
        qualification: "Post Graduate",
        experience: 15,
        __v: 0,
        avatar: "Screenshot 2024-06-05 152114.png",
        notes: "Rahul Sharma is a seasoned HR professional with over a decade of experience in managing human resources functions. He is responsible for recruitment, employee relations, performance management, and ensuring compliance with labor laws. Rahul's strategic approach to HR management has significantly contributed to improving employee satisfaction and retention rates within the organization."
    },
    {

        employee_id: "EM-1421487",
        full_name: "Pooja Nair",
        email: "pooja.nair@example.com",
        contact_number: "+91-9876543231",
        date_of_birth: "1988-02-18T00:00:00.000Z",
        age: 36,
        gender: "Female",
        address: "47965 Troy Junction, Aluva, Kochi",
        pincode: "683101",
        department: "Nursing",
        position: "Senior Nurse",
        qualification: "Graduate",
        experience: 12,
        __v: 0,
        avatar: "Screenshot 2024-06-05 152212.png",
        notes: "Pooja Nair is a highly skilled and compassionate Senior Nurse with extensive experience in patient care. She oversees the nursing staff and ensures that all patients receive high-quality medical attention. Pooja is known for her excellent bedside manner, leadership abilities, and commitment to continuous professional development. She plays a crucial role in maintaining the standards of nursing practice in the hospital."
    },
    {
        employee_id: "EM-8645582",
        full_name: "Shreya Patel",
        email: "shreya.patel@example.com",
        contact_number: "+91-9876543232",
        date_of_birth: "1990-10-02T00:00:00.000Z",
        age: 33,
        gender: "Female",
        address: "1 Havey Crossing, Vastrapur, Ahmedabad",
        pincode: "380015",
        department: "Pharmacy",
        position: "Pharmacist",
        qualification: "Graduate",
        experience: 10,
        __v: 0,
        avatar: "Screenshot 2024-06-05 152306.png",
        notes: "Shreya Patel is a dedicated pharmacist with a strong background in pharmacology and patient education. She is responsible for dispensing medications, counseling patients on proper medication use, and ensuring the safe and effective administration of pharmaceuticals. Shreya's meticulous attention to detail and commitment to patient safety make her an invaluable member of the healthcare team."
    },
    {
        employee_id: "EM-1900898",
        full_name: "Anil Kumar",
        email: "anil.kumar@example.com",
        contact_number: "+91-9876543233",
        date_of_birth: "1990-10-02T00:00:00.000Z",
        age: 63,
        gender: "Male",
        address: "43244 Corscot Trail, Rajouri Garden, Delhi",
        pincode: "110027",
        department: "Maintenance and Housekeeping",
        position: "Maintenance Supervisor",
        qualification: "12th Pass",
        experience: 30,
        __v: 0,
        avatar: "Screenshot 2024-06-05 152135.png",
        notes: "Anil Kumar is the Maintenance Supervisor, known for his hands-on approach and expertise in facility management. He oversees the maintenance team and ensures that the hospital's infrastructure and equipment are in optimal working condition. Anil's proactive maintenance strategies and problem-solving skills help prevent disruptions and ensure a safe environment for both patients and staff.\r\n"
    },
    {
        employee_id: "EM-2617337",
        full_name: "Divya Singh",
        email: "divya.singh@example.com",
        contact_number: "+91-9876543234",
        date_of_birth: "1978-01-27T00:00:00.000Z",
        age: 46,
        gender: "Female",
        address: "5 Porter Avenue, Indira Nagar, Lucknow",
        pincode: "226016",
        department: "Medical Records",
        position: "Records Manager",
        qualification: "Graduate",
        experience: 20,
        __v: 0,
        avatar: "Screenshot 2024-06-05 152233.png",
        notes: "Divya Singh is the Records Manager, responsible for the efficient management of medical records and health information systems. She ensures that patient records are accurate, secure, and accessible to authorized personnel. Divya's organizational skills and attention to detail are critical in maintaining the integrity of the hospital's medical records, supporting both clinical and administrative functions."
    },
    {
        employee_id: "EM-4151087",
        full_name: "Vikas Gupta",
        email: "vikas.gupta@example.com",
        contact_number: "+91-9876543235",
        date_of_birth: "1988-01-28T00:00:00.000Z",
        age: 36,
        gender: "Male",
        address: "46 Artisan Court, Mylapore,Chennai",
        pincode: "600004",
        department: "Laboratory",
        position: "Lab Technician",
        qualification: "Diploma or Equivalent",
        experience: 8,
        __v: 0,
        avatar: "Screenshot 2024-06-05 152124.png",
        notes: "Vikas Gupta is a skilled Lab Technician with expertise in conducting laboratory tests and analyzing specimens. He plays a key role in the diagnostic process, providing accurate and timely test results that aid in patient diagnosis and treatment. Vikas is known for his technical proficiency, adherence to safety protocols, and ability to operate advanced laboratory equipment."
    }
];

//Lab Report Data
const labData = [
    {
        patient_id: "PA-39-9940859",
        name: "Amit Kumar",
        ailment: "insomnia",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Polysomnography (Sleep Study),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Actigraphy,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Urine Tests</li></ol>",
        heart_rate: 73,
        blood_pressure: "120/80",
        temperature: 98.6,
        resp_rate: 16,
        oxygen_sat: 98,
        __v: 0
    },
    {
        patient_id: "PA-82-7040026",
        name: "Sita Sharma",
        ailment: "fatigue",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Thyroid Function Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Glucose Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Electrolyte Panel</li></ol>",
        heart_rate: 78,
        blood_pressure: "115/75",
        temperature: 98.4,
        resp_rate: 18,
        oxygen_sat: 97,
        __v: 0
    },
    {
        patient_id: "PA-51-5583244",
        name: "Ravi Verma",
        ailment: "allergies",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Allergy Skin Tests</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>IgE Antibody Blood Test</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC)</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Nasal Smear</li></ol>",
        lab_results: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Positive for pollen and dust mites</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Elevated IgE levels</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Normal</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Eosinophils present</li></ol>",
        heart_rate: 76,
        blood_pressure: "118/78",
        temperature: 98.6,
        resp_rate: 16,
        oxygen_sat: 98,
        __v: 0,
        result_date: "2024-05-09T00:00:00.000Z"
    },
    {
        patient_id: "PA-30-0417402",
        name: "Lakshmi Nair",
        ailment: "sore throat",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Throat Swab Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Rapid Strep Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Monospot Test</li></ol>",
        lab_results: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Streptococcus pyogenes detected</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Positive</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Elevated white blood cells</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Negative</li></ol>",
        heart_rate: 82,
        blood_pressure: "122/80",
        temperature: 99.1,
        resp_rate: 18,
        oxygen_sat: 96,
        __v: 0,
        result_date: "2024-04-14T00:00:00.000Z"
    },
    {
        patient_id: "PA-95-0067684",
        name: "Ramesh Gupta",
        ailment: "allergies",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Allergy Skin Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>IgE Antibody Blood Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Nasal Smear</li></ol>",
        lab_results: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Positive for pollen and dust mites</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Elevated IgE levels</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Normal</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Eosinophils present</li></ol>",
        heart_rate: 75,
        blood_pressure: "120/80",
        temperature: 98.6,
        resp_rate: 16,
        oxygen_sat: 98,
        __v: 0,
        result_date: "2024-05-22T00:00:00.000Z"
    },
    {
        patient_id: "PA-04-7961598",
        name: "Anita Singh",
        ailment: "allergies",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Allergy Skin Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>IgE Antibody Blood Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Nasal Smear</li></ol>",
        lab_results: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Positive for pollen and dust mites</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Elevated IgE levels</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Normal</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Eosinophils present</li></ol>",
        heart_rate: 74,
        blood_pressure: "118/78",
        temperature: 98.5,
        resp_rate: 16,
        oxygen_sat: 98,
        __v: 0,
        result_date: "2024-05-19T00:00:00.000Z"
    },
    {
        patient_id: "PA-83-4918209",
        name: "Kavita Joshi",
        ailment: "headache",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Magnetic Resonance Imaging (MRI),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Computed Tomography (CT) Scan,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Tests,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Eye Exam</li></ol>",
        lab_results: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>No abnormalities detected</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>No abnormalities detected</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Normal</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Normal</li></ol>",
        heart_rate: 80,
        blood_pressure: "120/80",
        temperature: 98.6,
        resp_rate: 16,
        oxygen_sat: 98,
        __v: 0,
        result_date: "2024-05-12T00:00:00.000Z"
    },
    {
        patient_id: "PA-28-8523048",
        name: "Manoj Patel",
        ailment: "sore throat",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Throat Swab Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Rapid Strep Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Monospot Test</li></ol>",
        lab_results: "<p>Streptococcus pyogenes detected</p><p>Positive</p><p>Elevated white blood cells</p><p>Negative</p>",
        heart_rate: 85,
        blood_pressure: "122/82",
        temperature: 99,
        resp_rate: 18,
        oxygen_sat: 96,
        __v: 0,
        result_date: "2024-05-28T00:00:00.000Z"
    },
    {
        patient_id: "PA-55-7237124",
        name: "Bharat Desai",
        ailment: "fever",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Blood Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Urinalysis,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Chest X-Ray</li></ol>",
        lab_results: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Elevated white blood cells</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>No growth</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Normal</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Normal</li></ol>",
        heart_rate: 90,
        blood_pressure: "118/76",
        temperature: 100.4,
        resp_rate: 20,
        oxygen_sat: 95,
        __v: 0,
        result_date: "2024-05-17T00:00:00.000Z"
    },
    {
        patient_id: "PA-77-9181409",
        name: "Geeta Mehta",
        ailment: "sore throat",
        lab_tests: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Throat Swab Culture,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Rapid Strep Test,</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Complete Blood Count (CBC),</li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Monospot Test</li></ol>",
        lab_results: "<p>Streptococcus pyogenes detected</p><p>Positive</p><p>Elevated white blood cells</p><p>Negative</p>",
        heart_rate: 84,
        blood_pressure: "120/80",
        temperature: 99.2,
        resp_rate: 18,
        oxygen_sat: 96,
        __v: 0,
        result_date: "2024-05-20T00:00:00.000Z"
    }
];

//Patient Data
const patientData = [
    {
        patient_id: "PA-39-9940859",
        name: "Amit Kumar",
        email: "amit.kumar@example.com",
        dob: new Date("1987-03-15T00:00:00.000Z"),
        age: 37,
        gender: "Male",
        contact: "+91-9876543210",
        emergency_contact: "+91-9876543211",
        address: "009 Crest Line Road, Vasant Kunj, New Delhi",
        marital_status: "Married",
        ailment: "insomnia",
        type: "Out-patient",
        doc_assign: "Rohan Singh",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-82-7040026",
        name: "Sita Sharma",
        email: "sita.sharma@example.com",
        dob: new Date("1973-03-15T00:00:00.000Z"),
        age: 63,
        gender: "Female",
        contact: "+91-9876543212",
        emergency_contact: "+91-9876543213",
        address: "1 Pepper Wood Court, Bandra, Mumbai",
        marital_status: "Widowed",
        ailment: "fatigue",
        type: "In-patient",
        doc_assign: "Maya Iyer",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-51-5583244",
        name: "Ravi Verma",
        email: "ravi.verma@example.com",
        dob: new Date("1980-05-23T00:00:00.000Z"),
        age: 43,
        gender: "Male",
        contact: "+91-9876543214",
        emergency_contact: "+91-9876543215",
        address: "3732 Monica Plaza, Indiranagar, Bangalore",
        marital_status: "Divorced",
        ailment: "allergies",
        type: "Out-patient",
        doc_assign: "Rohan Singh",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-30-0417402",
        name: "Lakshmi Nair",
        email: "lakshmi.nair@example.com",
        dob: new Date("1975-08-31T00:00:00.000Z"),
        age: 48,
        gender: "Female",
        contact: "+91-9876543216",
        emergency_contact: "+91-9876543217",
        address: "4361 Londonderry Hill, Palarivattom, Kochi",
        marital_status: "Single",
        ailment: "sore throat",
        type: "In-patient",
        doc_assign: "Maya Iyer",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-95-0067684",
        name: "Ramesh Gupta",
        email: "ramesh.gupta@example.com",
        dob: new Date("1984-05-08T00:00:00.000Z"),
        age: 40,
        gender: "Male",
        contact: "+91-9876543218",
        emergency_contact: "+91-9876543219",
        address: "440 Loftsgordon Avenue, Banjara Hills, Hyderabad",
        marital_status: "Single",
        ailment: "allergies",
        type: "Out-patient",
        doc_assign: "Aarav Mehta",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-04-7961598",
        name: "Anita Singh",
        email: "anita.singh@example.com",
        dob: new Date("1995-12-27T00:00:00.000Z"),
        age: 28,
        gender: "Female",
        contact: "+91-9876543220",
        emergency_contact: "+91-9876543221",
        address: "7482 Anthes Point, Gomti Nagar, Lucknow",
        marital_status: "Single",
        ailment: "allergies",
        type: "In-patient",
        doc_assign: "Ishaan Bhatt",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-83-4918209",
        name: "Kavita Joshi",
        email: "kavita.joshi@example.com",
        dob: new Date("1973-10-31T00:00:00.000Z"),
        age: 50,
        gender: "Female",
        contact: "+91-9876543222",
        emergency_contact: "+91-9876543223",
        address: "53315 Anhalt Court, JP Nagar, Bangalore",
        marital_status: "Divorced",
        ailment: "headache",
        type: "Out-patient",
        doc_assign: "Ishaan Bhatt",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-28-8523048",
        name: "Manoj Patel",
        email: "manoj.patel@example.com",
        dob: new Date("1966-02-27T14:40:00.000Z"),
        age: 55,
        gender: "Male",
        contact: "+91-9876543224",
        emergency_contact: "+91-9876543225",
        address: "7701 Michigan Park, Ellis Bridge, Ahmedabad",
        marital_status: "Married",
        ailment: "sore throat",
        type: "In-patient",
        doc_assign: "Anita Chatterjee",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-55-7237124",
        name: "Bharat Desai",
        email: "bharat.desai@example.com",
        dob: new Date("1980-10-23T00:00:00.000Z"),
        age: 43,
        gender: "Male",
        contact: "+91-9876543226",
        emergency_contact: "+91-9876543227",
        address: "5938 Ryan Court, Salt Lake, Kolkata",
        marital_status: "Married",
        ailment: "fever",
        type: "Out-patient",
        doc_assign: "Aarav Mehta",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
    {
        patient_id: "PA-77-9181409",
        name: "Geeta Mehta",
        email: "geeta.mehta@example.com",
        dob: new Date("1964-06-17T00:00:00.000Z"),
        age: 58,
        gender: "Female",
        contact: "+91-9876543228",
        emergency_contact: "+91-9876543229",
        address: "53745 Prairieview Court, Vile Parle, Mumbai",
        marital_status: "Divorced",
        ailment: "sore throat",
        type: "In-patient",
        doc_assign: "Anita Chatterjee",
        treat_status: "Ongoing",
        is_discharged: false,
        __v: 0,
    },
];

//Prescription Data
const prescriptionData = [{
    _id: "665f1d35035b109914313bc5",
    patient_id: "PA-39-9940859",
    name: "Amit Kumar",
    ailment: "insomnia",
    notes: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Prescribed 10mg Zolpidem tablets to be taken once daily at bedtime. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Recommended sleep hygiene practices including maintaining a regular sleep schedule. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Advised to avoid caffeine and heavy meals before bedtime. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Suggested relaxation techniques such as meditation or a warm bath before bed. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Follow-up in two weeks to assess effectiveness and make any necessary adjustments.</li></ol>",
    __v: 0,
    address: "",
    age: null,
    type: ""
},
{
    _id: "665f1d35035b109914313bc6",
    patient_id: "PA-82-7040026",
    name: "Sita Sharma",
    ailment: "fatigue",
    notes: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Advised daily multivitamin supplements and a balanced diet rich in iron. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Recommended regular light exercise, such as walking for 30 minutes a day. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Encouraged to maintain a consistent sleep schedule and practice good sleep hygiene. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Suggested reducing stress through activities like yoga or meditation. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Follow-up in one month to monitor energy levels and overall well-being.</li></ol>",
    __v: 0,
    address: "",
    age: null,
    type: ""
},
{
    _id: "665f1d35035b109914313bc8",
    patient_id: "PA-30-0417402",
    name: "Lakshmi Nair",
    ailment: "sore throat",
    notes: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Prescribed 500mg Amoxicillin tablets to be taken thrice daily for 7 days. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Advised to stay hydrated and use throat lozenges to soothe throat irritation. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Recommended gargling with warm salt water several times a day. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Suggested avoiding irritants such as smoking and alcohol. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Follow-up if no improvement or if symptoms worsen within a week.</li></ol>",
    __v: 0,
    address: "",
    age: null,
    type: ""
},
{
    _id: "665f1d35035b109914313bc9",
    patient_id: "PA-95-0067684",
    name: "Ramesh Gupta",
    ailment: "allergies",
    notes: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Prescribed 5mg Loratadine tablets once daily for allergy symptom relief. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Advised to use saline nasal spray as needed to clear nasal passages. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Recommended keeping windows closed during high pollen days to minimize exposure. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Suggested washing bedding frequently to reduce dust mites. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Follow-up if symptoms do not improve or if new symptoms develop.</li></ol>",
    __v: 0,
    address: "",
    age: null,
    type: ""
},
{
    _id: "665f1d35035b109914313bcc",
    patient_id: "PA-28-8523048",
    name: "Manoj Patel",
    ailment: "sore throat",
    notes: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Prescribed 250mg Erythromycin tablets to be taken thrice daily for 7 days. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Advised to rest and drink warm fluids like herbal tea with honey. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Recommended using throat lozenges or sprays to soothe irritation. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Suggested avoiding irritants such as smoke and strong odors. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Follow-up if no improvement or if symptoms worsen within a week.</li></ol>",
    __v: 0,
    address: "",
    age: null,
    type: ""
},
{
    _id: "665f1d35035b109914313bcd",
    patient_id: "PA-55-7237124",
    name: "Bharat Desai",
    ailment: "fever",
    notes: "<ol><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Prescribed 500mg Paracetamol tablets to be taken every 6 hours to reduce fever. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Advised to stay hydrated by drinking plenty of fluids. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Recommended rest and avoiding strenuous activities until fever subsides. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Suggested using a cool compress to alleviate discomfort. </li><li data-list=\"ordered\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Follow-up if fever persists for more than 3 days or if symptoms worsen.</li></ol>",
    __v: 0,
    address: "",
    age: null,
    type: ""
}];

//Pharmacy Data
const pharmacyData = [
    {
        name: "Cefixime",
        quantity: 180,
        category: "Antibiotics",
        vendor: "PharmaGlobe",
        barcode_number: "8909876543210",
        description: "<p>Cefixime is a third-generation cephalosporin antibiotic used to treat a wide variety of bacterial infections. It works by stopping the growth of bacteria and is commonly prescribed for respiratory tract infections, urinary tract infections, and gonorrhea. PharmaGlobe ensures the highest quality standards in the production of Cefixime, making it a trusted choice for healthcare providers.</p>",
        __v: 0,
    },
    {
        name: "Paracetamol",
        quantity: 150,
        category: "Analgesics",
        vendor: "MedVista Pharmaceuticals",
        barcode_number: "8904567890123",
        description: "<p>Paracetamol, also known as acetaminophen, is an over-the-counter medication widely used to relieve pain and reduce fever. It is commonly used to treat headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers. MedVista Pharmaceuticals produces Paracetamol with a commitment to quality and safety, ensuring effective relief for patients.</p>",
        __v: 0,
    },
    {
        name: "Levothyroxine",
        quantity: 200,
        category: "Hormonal medications",
        vendor: "Apex Pharma Solutions",
        barcode_number: "8903210987654",
        description: "<p>Levothyroxine is a synthetic thyroid hormone used to treat hypothyroidism, a condition where the thyroid gland does not produce enough thyroid hormone. It helps restore normal thyroid levels and supports metabolic functions. Apex Pharma Solutions provides Levothyroxine with precise formulation to ensure consistent and reliable hormone replacement therapy.</p>",
        __v: 0,
    },
    {
        name: "BCG Vaccine",
        quantity: 190,
        category: "Vaccines",
        vendor: "PharmaGlobe",
        barcode_number: "8909876543201",
        description: "<p> The Bacillus Calmette-Guérin (BCG) vaccine is primarily used to prevent tuberculosis (TB) in children. It is also used as an immunotherapy agent for bladder cancer. PharmaGlobe's BCG Vaccine is produced under stringent conditions to maintain its efficacy and safety, making it a vital tool in public health.</p>",
        __v: 0,
    },
    {
        name: "Azithromycin",
        quantity: 170,
        category: "Antibiotics",
        vendor: "PharmaSolutions",
        barcode_number: "8906543210987",
        description: "<p>Azithromycin is a broad-spectrum antibiotic used to treat various bacterial infections, including respiratory infections, skin infections, ear infections, and sexually transmitted diseases. It is known for its once-daily dosing and short treatment courses. PharmaSolutions ensures that their Azithromycin is of the highest quality, providing effective treatment options for patients.</p>",
        __v: 0,
    },
    {
        name: "Ibuprofen",
        quantity: 130,
        category: "Analgesics",
        vendor: "PharmaSolutions",
        barcode_number: "8900987654321",
        description: "<p>Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever, pain, and inflammation. It is commonly used for headaches, toothaches, menstrual cramps, muscle aches, and arthritis. PharmaSolutions produces Ibuprofen with rigorous quality control to ensure effective and safe pain relief for patients.</p>",
        __v: 0,
    },
    {
        name: "Insulin Glargine",
        quantity: 160,
        category: "Hormonal medications",
        vendor: "PharmaSolutions",
        barcode_number: "8905678901234",
        description: "<p>Insulin Glargine is a long-acting insulin used to control blood sugar levels in people with diabetes mellitus. It helps manage blood glucose levels throughout the day and night with a single daily injection. PharmaSolutions' Insulin Glargine is formulated to provide steady and reliable glucose control, aiding patients in their diabetes management.</p>",
        __v: 0,
    },
    {
        name: "Atorvastatin",
        quantity: 140,
        category: "Hormonal medications",
        vendor: "Apex Pharma Solutions",
        barcode_number: "8902345678901",
        description: "<p>Atorvastatin is a statin medication used to lower cholesterol and triglyceride levels in the blood, reducing the risk of cardiovascular disease. It is particularly effective in lowering LDL cholesterol and increasing HDL cholesterol. Apex Pharma Solutions' Atorvastatin is manufactured with high standards to ensure patients receive effective and safe cholesterol management.</p>",
        __v: 0,
    },
];

//Pharmacy Data
const payrollData = [
    {
        employee_id: "EM-6556967",
        full_name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        department: "Administration",
        position: "HR Manager",
        salary: 78859,
        payroll_desc: "<p>Rahul Sharma, holding the position of HR Manager in the Administration department, earns an annual salary of ₹78,859.00. His role involves overseeing HR operations, managing recruitment processes, and ensuring compliance with company policies.</p>",
        payment_status: "Unpaid",
        posted_date: new Date("2024-06-05T10:05:06.631Z"),
        __v: 0,
    },
    {
        employee_id: "EM-1900898",
        full_name: "Anil Kumar",
        email: "anil.kumar@example.com",
        department: "Maintenance and Housekeeping",
        position: "Maintenance Supervisor",
        salary: 35423,
        payroll_desc: "<p>Anil Kumar serves as the Maintenance Supervisor in the Maintenance and Housekeeping department. He is responsible for maintaining the hospital facilities, ensuring that all equipment is in working order, and supervising the housekeeping staff. Anil earns an annual salary of ₹35,423.00.</p>",
        payment_status: "Unpaid",
        posted_date: new Date("2024-06-05T10:16:30.592Z"),
        __v: 0,
    },
];


const initDB = async () => {
    await Admin.deleteMany({});
    await Admin.insertMany(adminData)
    console.log("Admins inserted successfully");

    await Doctor.deleteMany({});
    await Doctor.insertMany(doctorData)
    console.log("Doctors inserted successfully");

    await Appointment.deleteMany({});
    await Appointment.insertMany(appointmentData)
    console.log("Appointments inserted successfully");

    await Employee.deleteMany({});
    await Employee.insertMany(employeeData)
    console.log("Employees inserted successfully");

    await LabReport.deleteMany({});
    await LabReport.insertMany(labData)
    console.log("Lab Data inserted successfully");

    await Patient.deleteMany({});
    await Patient.insertMany(patientData)
    console.log("Patient Data inserted successfully");

    await Prescription.deleteMany({});
    await Prescription.insertMany(prescriptionData)
    console.log("Prescription Data inserted successfully");

    await Pharmacy.deleteMany({});
    await Pharmacy.insertMany(pharmacyData)
    console.log("Prescription Data inserted successfully");

    await Payroll.deleteMany({});
    await Payroll.insertMany(payrollData)
    console.log("Payroll Data inserted successfully");
}

initDB();