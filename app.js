let tugas = [];
let filterAktif = "semua";
let statusMuat = "loading";
let pesanError = "";
let matkulList = [];

async function api(url, options = {}) {
    const res = await fetch(url, options);

    // Respons DELETE 204 tidak mempunyai body.
    const data = res.status === 204
        ? null
        : await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(
            data?.error ||
            data?.message ||
            `Permintaan gagal (${res.status}).`
        );
    }

    return data;
}

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

async function muatData() {
    statusMuat = "loading";
    pesanError = "";
    render();

    try {
        const [dataTugas, dataMatkul] = await Promise.all([
            api("/api/tugas"),
            api("/api/matkul")
        ]);

        tugas = dataTugas;
        matkulList = dataMatkul;

        renderMatkul();

        statusMuat = "success";
    } catch (error) {
        statusMuat = "error";
        pesanError = error.message || "Gagal memuat data.";
    } finally {
        render();
    }
}

const tombolUlang = document.querySelector("#ulang");

tombolUlang.addEventListener("click", () => {
    muatData();
});

function renderMatkul() {
    const select = document.querySelector("#matkul");
    const pilihanLama = select.value;

    select.replaceChildren();

    matkulList.forEach((item) => {
        const nama = typeof item === "string"
            ? item
            : item.nama ?? item.matkul ?? item.name;

        if (!nama) {
            return;
        }

        const option = document.createElement("option");
        option.value = nama;
        option.textContent = nama;

        select.append(option);
    });

    if ([...select.options].some(
        (option) => option.value === pilihanLama
    )) {
        select.value = pilihanLama;
    }
}

const form = document.querySelector("#form-tugas");
const judulInput = document.querySelector("#judul");
const matkulInput = document.querySelector("#matkul");
const deadlineInput = document.querySelector("#deadline");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const judul = judulInput.value.trim();
    const matkul = matkulInput.value;
    const deadline = deadlineInput.value;
    const tombolTambah = form.querySelector('button[type="submit"]');
    const pesanForm = document.querySelector("#pesan-form");

    pesanForm.textContent = "";

    if (judul.length < 3) {
        pesanForm.textContent = "Judul tugas minimal 3 karakter.";
        return;
    }

    if (deadline === "") {
        pesanForm.textContent = "Deadline wajib diisi.";
        return;
    }

    tombolTambah.disabled = true;

    try {
        const data = await api("/api/tugas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                judul: judul,
                matkul: matkul,
                deadline: deadline
            })
        });

        tugas.push(data);
        form.reset();
        statusMuat = "success";
        render();

        pesanForm.textContent = "Tugas berhasil ditambahkan.";
    } catch (error) {
        pesanForm.textContent =
            error.message || "Terjadi kesalahan saat menambahkan tugas.";
    } finally {
        tombolTambah.disabled = false;
    }
});

const daftar = document.querySelector("#daftar");


daftar.addEventListener("click", async (e) => {
    const li = e.target.closest(".task");

    if (!li) {
        return;
    }

    const id = li.dataset.id;
    const item = tugas.find((item) => String(item.id) === id);

    if (!item) {
        return;
    }

    const pesanForm = document.querySelector("#pesan-form");

    // PATCH: mengubah status tugas.
    if (e.target.matches('input[type="checkbox"]')) {
        const checkbox = e.target;
        checkbox.disabled = true;
        pesanForm.textContent = "";

        try {
            const data = await api(`/api/tugas/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    selesai: checkbox.checked
                })
            });

            const index = tugas.findIndex(
                (item) => String(item.id) === id
            );

            if (index !== -1) {
                tugas[index] = data;
            }

            render();
        } catch (error) {
            pesanForm.textContent =
                error.message || "Gagal memperbarui tugas.";

            // Kembalikan tampilan checkbox ke state sebelumnya.
            render();
        }

        return;
    }

    // DELETE: menghapus tugas.
    if (e.target.closest(".hapus")) {
        const tombolHapus = e.target.closest(".hapus");
        tombolHapus.disabled = true;
        pesanForm.textContent = "";

        try {
            await api(`/api/tugas/${encodeURIComponent(id)}`, {
                method: "DELETE"
            });

            tugas = tugas.filter(
                (item) => String(item.id) !== id
            );

            render();
        } catch (error) {
            pesanForm.textContent =
                error.message || "Gagal menghapus tugas.";

            render();
        }
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

muatData();