const tugas = [
    {
        id: 1,
        judul: "Lab 10 event delegation",
        matkul: "Pemrograman Web",
        deadline: "2026-10-08",
        selesai: false
    },
    {
        id: 2,
        judul: "Kuis",
        matkul: "KJK",
        deadline: "2026-10-12",
        selesai: true
    }
];

let filterAktif = "semua";

function render() {
    const daftar = document.querySelector("#daftar");

    daftar.innerHTML = "";

    const ringkasan = document.querySelector("#ringkasan");
    const jumlahAktif = tugas.filter((item) => !item.selesai).length;

    ringkasan.textContent = `${jumlahAktif} tugas aktif`;

    const tugasTampil = tugas.filter((item) => {
        if (filterAktif === "aktif") {
            return !item.selesai;
        }

        if (filterAktif === "selesai") {
            return item.selesai;
        }

        return true;
    })

    tugasTampil.forEach((item) => {
        const li = document.createElement("li");
        li.classList.add("task");
        li.dataset.id = item.id;

        if (item.selesai) {
            li.classList.add("selesai");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.selesai;

        const info = document.createElement("div");
        info.classList.add("task-info");

        const judul = document.createElement("p");
        judul.classList.add("task-title");
        judul.textContent = item.judul;

        const meta = document.createElement("p");
        meta.classList.add("task-meta");
        meta.textContent = `${item.matkul} · deadline ${item.deadline}`;

        info.append(judul, meta);

        const hapus = document.createElement("button");
        hapus.classList.add("hapus");
        hapus.textContent = "×";

        li.append(checkbox, info, hapus);
        daftar.append(li);
    });
}

render();

const form = document.querySelector("#form-tugas");
const judulInput = document.querySelector("#judul");
const matkulInput = document.querySelector("#matkul");
const deadlineInput = document.querySelector("#deadline");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const judul = judulInput.value.trim();
    const matkul = matkulInput.value;
    const deadline = deadlineInput.value;

    if (judul.length < 3) {
        alert("Judul tugas minimal 3 karakter.");
        return;
    }

    if (deadline === "") {
        alert("Deadline wajib diisi.");
        return;
    }

    const tugasBaru = {
        id: Date.now(),
        judul: judul,
        matkul: matkul,
        deadline: deadline,
        selesai: false
    };

    tugas.push(tugasBaru);

    form.reset();

    render();
});

const daftar = document.querySelector("#daftar");

daftar.addEventListener("click", (e) => {
    const li = e.target.closest(".task");

    if (!li) {
        return;
    }

    const index = tugas.findIndex((item) => item.id === Number(li.dataset.id));

    if (index === -1) {
        return;
    }

    if (e.target.matches('input[type="checkbox"]')) {
        tugas[index].selesai = e.target.checked;
        render();
    }

    if (e.target.closest(".hapus")) {
        tugas.splice(index, 1);
        render();
    }
});

const filter = document.querySelector("#filter");

filter.addEventListener("click", (e) => {
    const tombol = e.target.closest("button");

    if (!tombol) {
        return;
    }

    filterAktif = tombol.dataset.filter;

    filter.querySelectorAll("button").forEach((button) => {
        button.classList.remove("on");
    });

    tombol.classList.add("on");

    render();
});