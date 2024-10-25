// Variables
let students = [];
let defenses = [];

// Ajouter un étudiant
document.getElementById("add-student").addEventListener("click", () => {
    const studentName = document.getElementById("student-name").value;
    const studentClass = document.getElementById("student-class").value;

    if (studentName && studentClass) {
        students.push({ name: studentName, class: studentClass });
        displayStudents();
        document.getElementById("student-name").value = ""; // Clear input
    }
});

// Afficher la liste des étudiants
function displayStudents() {
    const studentsList = document.getElementById("students");
    studentsList.innerHTML = ""; // Clear list

    students.forEach((student, index) => {
        const li = document.createElement("li");
        li.textContent = `${student.name} - ${student.class}`;
        studentsList.appendChild(li);
    });
}

// Créer une soutenance
document.getElementById("create-defense").addEventListener("click", () => {
    const defenseName = document.getElementById("defense-name").value;
    
    if (defenseName && students.length > 0) {
        defenses.push({ name: defenseName, students: [...students] });
        displayDefenses();
        document.getElementById("defense-name").value = ""; // Clear input
    }
});

// Afficher la liste des soutenances
function displayDefenses() {
    const defensesList = document.getElementById("defenses");
    defensesList.innerHTML = ""; // Clear list

    defenses.forEach((defense, index) => {
        const li = document.createElement("li");
        const studentNames = defense.students.map(student => `${student.name} (${student.class})`).join(", ");
        li.textContent = `Soutenance: ${defense.name} - Étudiants: ${studentNames}`;
        defensesList.appendChild(li);
    });
}

// Supprimer un étudiant
document.getElementById("delete-student").addEventListener("click", () => {
    const studentToDelete = document.getElementById("student-to-delete").value;

    if (studentToDelete) {
        students = students.filter(student => student.name !== studentToDelete);
        displayStudents();
        document.getElementById("student-to-delete").value = ""; // Clear input
    }
});
