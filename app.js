let tugas = [];
let filterAktif = "semua";
let statusMuat = "loading";
let pesanError = "";

function render() {
    const daftar = document.querySelector("#daftar");
    const status = document.querySelector("#status");
    const ulang = document.querySelector("#ulang");
    const ringkasan = document.querySelector("#ringkasan");

    daftar.replaceChildren();
    ulang.hidden = true;

    if (statusMuat === "loading") {
        status.textContent = "Memuat tugas...";
        ringkasan.textContent = "Memuat tugas...";
        return;
    }

    if (statusMuat === "error") {
        status.textContent = pesanError;
        ringkasan.textContent = "Tugas gagal dimuat";
        ulang.hidden = false;
        return;
    }

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
    });

    if (tugasTampil.length === 0) {
        status.textContent = tugas.length === 0
            ? "Belum ada tugas. Yuk, tambahkan tugas pertamamu!"
            : "Tidak ada tugas pada filter ini.";
        return;
    }

    status.textContent = "";

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

async function muatTugas() {
    statusMuat = "loading";
    pesanError = "";
    render();

    try {
        const res = await fetch("/api/tugas");

        if (!res.ok) {
            throw new Error(`Gagal memuat tugas: ${res.status}`);
        }

        tugas = await res.json();
        statusMuat = "success";
    } catch (error) {
        statusMuat = "error";
        pesanError = error.message || "Terjadi kesalahan saat memuat tugas.";
    } finally {
        render();
    }
}

const tombolUlang = document.querySelector("#ulang");

tombolUlang.addEventListener("click", () => {
    muatTugas();
});

muatTugas();

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