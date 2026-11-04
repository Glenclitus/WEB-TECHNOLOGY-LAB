// EXPERIMENT 10: WORKING WITH MONGODB USING SHELL COMMANDS (mongosh)

// 1. DATABASE AND COLLECTION MANAGEMENT
// Interactive equivalents: show dbs; use universityDB; db; show collections;
db.adminCommand({ listDatabases: 1 });
const universityDB = db.getSiblingDB("universityDB");
universityDB.getName();
universityDB.createCollection("students");
universityDB.getCollectionNames();

// 2. CREATE OPERATIONS
universityDB.students.insertOne({
    student_id: 101,
    name: "Alice Smith",
    age: 20,
    major: "Computer Science",
    gpa: 3.8,
    skills: ["Python", "MongoDB"],
    enrollmentDate: new Date("2023-09-01")
});

universityDB.students.insertMany([
    {
        student_id: 102,
        name: "Bob Jones",
        age: 22,
        major: "Data Science",
        gpa: 3.4,
        skills: ["R", "Python", "SQL"],
        enrollmentDate: new Date("2022-09-01")
    },
    {
        student_id: 103,
        name: "Charlie Brown",
        age: 21,
        major: "Computer Science",
        gpa: 2.8,
        skills: ["Java", "C++"],
        enrollmentDate: new Date("2023-01-15")
    },
    {
        student_id: 104,
        name: "Diana Prince",
        age: 23,
        major: "Cybersecurity",
        gpa: 3.9,
        skills: ["Linux", "Python", "Networking"],
        enrollmentDate: new Date("2021-09-01")
    }
]);

// 3. READ OPERATIONS
universityDB.students.find();
universityDB.students.find({ major: "Computer Science" });
universityDB.students.find({ gpa: { $gte: 3.5 } });
universityDB.students.find({ age: { $lt: 23 } });
universityDB.students.find({
    $or: [
        { major: "Cybersecurity" },
        { skills: "MongoDB" }
    ]
});
universityDB.students.find({}, { name: 1, gpa: 1, major: 1, _id: 0 });
universityDB.students.findOne({ student_id: 101 });
universityDB.students.countDocuments({ major: "Computer Science" });

// 4. UPDATE OPERATIONS
universityDB.students.updateOne(
    { student_id: 101 },
    { $set: { gpa: 3.9, age: 21 } }
);

universityDB.students.updateMany(
    { major: "Computer Science" },
    { $push: { skills: "Git" } }
);

universityDB.students.updateOne(
    { student_id: 102 },
    { $inc: { age: 1 } }
);

// 5. INDEXING
universityDB.students.createIndex({ student_id: 1 }, { unique: true });
universityDB.students.getIndexes();

// 6. DELETE OPERATIONS AND CLEANUP
universityDB.students.deleteOne({ student_id: 103 });
universityDB.students.deleteMany({ gpa: { $lt: 3.0 } });
// Keep the database visible in MongoDB Compass after the experiment.
// universityDB.students.drop();
// universityDB.dropDatabase();
