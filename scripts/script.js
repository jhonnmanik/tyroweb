const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {

    navToggle.addEventListener('click', function () {
        const sedangTerbuka = navLinks.classList.contains('terbuka');

        if (sedangTerbuka) {
            tutupMenu();
        } else {
            bukaMenu();
        }
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            tutupMenu();
        });
    });

    document.addEventListener('click', function (event) {
        const nav = document.querySelector('nav');
        if (nav && !nav.contains(event.target)) {
            tutupMenu();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            tutupMenu();
        }
    });
}


function bukaMenu() {
    navLinks.classList.add('terbuka');
    navToggle.setAttribute('aria-expanded', 'true');
}

function tutupMenu() {
    navLinks.classList.remove('terbuka');
    navToggle.setAttribute('aria-expanded', 'false');
    // document.body.style.overflow = '';
}


const htmlEditor  = document.getElementById('html-editor');
const cssEditor   = document.getElementById('css-editor');
const jsEditor    = document.getElementById('js-editor');
const liveOutput  = document.getElementById('live-output');

if (htmlEditor && cssEditor && jsEditor && liveOutput) {

    function perbaruiOutput() {
        const htmlKode = htmlEditor.value;
        const cssKode  = cssEditor.value;
        const jsKode   = jsEditor.value;

        const dokumenLengkap = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${cssKode}</style>
</head>
<body>
    ${htmlKode}
    <script>
        // Bungkus dalam try-catch agar error JS tidak merusak iframe
        try {
            ${jsKode}
        } catch (err) {
            document.body.innerHTML += '<p style="color:red;font-family:monospace;padding:10px;background:#fee;border-radius:6px;">⚠️ Error JS: ' + err.message + '</p>';
        }
    <\/script>
</body>
</html>`;

        liveOutput.srcdoc = dokumenLengkap;
    }

    htmlEditor.addEventListener('input', perbaruiOutput);
    cssEditor.addEventListener('input',  perbaruiOutput);
    jsEditor.addEventListener('input',   perbaruiOutput);

    perbaruiOutput();

    [htmlEditor, cssEditor, jsEditor].forEach(function (editor) {
        editor.addEventListener('keydown', function (event) {
            if (event.key === 'Tab') {
                event.preventDefault();
                const start  = this.selectionStart;
                const end    = this.selectionEnd;
                this.value   = this.value.substring(0, start) + '  ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 2;
            }
        });
    });
}


const quizForm   = document.getElementById('quizForm');
const quizResult = document.getElementById('quiz-result');

if (quizForm && quizResult) {

    // Kunci jawaban yang benar untuk setiap soal
    // Format: { nama_soal: 'nilai_jawaban_benar' }
    const kunciJawaban = {
        q1: 'a', // HyperText Markup Language
        q2: 'b', // background-color
        q3: 'c', // let x = 10;
    };

    // Saat form di-submit (tombol "Cek Skor" diklik)
    quizForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Cegah halaman reload

        let skorBenar = 0;
        const totalSoal = Object.keys(kunciJawaban).length;
        let adaYangBelumDijawab = false;

        // Periksa setiap jawaban
        for (const soal in kunciJawaban) {
            const jawabanDipilih = quizForm.querySelector(`input[name="${soal}"]:checked`);

            if (!jawabanDipilih) {
                // Pengguna belum memilih jawaban untuk soal ini
                adaYangBelumDijawab = true;
                break;
            }

            if (jawabanDipilih.value === kunciJawaban[soal]) {
                skorBenar++; // Tambah skor jika benar
            }
        }

        // Jika ada soal yang belum dijawab, tampilkan peringatan
        if (adaYangBelumDijawab) {
            quizResult.innerHTML = '⚠️ Jawab semua pertanyaan terlebih dahulu ya!';
            quizResult.style.borderColor = '#F59E0B';
            quizResult.style.background  = '#FFFBEB';
            quizResult.style.color       = '#92400E';
            return;
        }

        // Hitung persentase skor
        const persentase = Math.round((skorBenar / totalSoal) * 100);

        // Tentukan pesan berdasarkan skor
        let emoji, pesan;
        if (persentase === 100) {
            emoji = '🎉';
            pesan = 'Sempurna! Kamu luar biasa!';
        } else if (persentase >= 67) {
            emoji = '👏';
            pesan = 'Bagus! Terus belajar ya!';
        } else if (persentase >= 34) {
            emoji = '💪';
            pesan = 'Lumayan! Ulangi materinya dan coba lagi.';
        } else {
            emoji = '📖';
            pesan = 'Yuk baca materinya lagi dari awal!';
        }

        // Tampilkan hasil
        quizResult.innerHTML = `
            <div style="font-size:2rem;margin-bottom:0.5rem;">${emoji}</div>
            <div style="font-size:1.5rem;font-weight:800;color:#0F172A;margin-bottom:0.25rem;">
                ${skorBenar} / ${totalSoal} Benar
            </div>
            <div style="font-size:0.9rem;color:#6B7280;">${pesan}</div>
        `;

        // Scroll halaman ke area hasil agar pengguna bisa melihatnya
        quizResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}


/**
 * Menampilkan modal dengan pesan tertentu
 * @param {string} pesan - Teks yang akan ditampilkan di dalam modal
 */
function tampilkanModal(pesan) {
    const modal   = document.getElementById('customModal');
    const isiPesan = document.getElementById('modalMessage');

    if (modal && isiPesan) {
        isiPesan.textContent = pesan;
        modal.classList.add('aktif');

        modal.addEventListener('click', function tutupJikaKlikLuar(event) {
            if (event.target === modal) {
                tutupModal();
                modal.removeEventListener('click', tutupJikaKlikLuar);
            }
        });
    }
}

/* Menutup modal yang sedang terbuka */
function tutupModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('aktif');
    }
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        tutupModal();
    }
});



// Daftar warna yang akan bergantian saat tombol diklik
const daftarWarna = [
    '#6366F1', // Indigo
    '#3B82F6', // Biru
    '#10B981', // Hijau Emerald
    '#F59E0B', // Amber
    '#EF4444', // Merah
    '#8B5CF6', // Ungu
    '#EC4899', // Pink
];

let indeksWarnaSaatIni = 0;

function ubahWarnaContoh() {
    const kotak = document.getElementById('kotak');
    if (!kotak) return;

    // Pindah ke warna berikutnya
    indeksWarnaSaatIni = (indeksWarnaSaatIni + 1) % daftarWarna.length;
    const warnaBaru = daftarWarna[indeksWarnaSaatIni];

    // Terapkan warna baru ke kotak
    kotak.style.background = warnaBaru;
    kotak.style.boxShadow  = `0 8px 24px ${warnaBaru}60`;
}