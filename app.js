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
        judul: "ERD sistem perpustakaan",
        matkul: "Basis Data",
        deadline: "2026-10-12",
        selesai: true
    }
];

function render() {
    const daftar = document.querySelector("#daftar");

    daftar.innerHTML = "";

    tugas.forEach((item) => {
        const li = document.createElement("li");
        li.classList.add("task");

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