// 1. Mobile Menu Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// 2. Active Link Highlighter
const currentLocation = location.href;
const menuItem = document.querySelectorAll('.nav-links a');
for (let i = 0; i < menuItem.length; i++) {
    if (menuItem[i].href === currentLocation) {
        menuItem[i].className = "active";
    }
}

// 3. Modal System
const modal = document.getElementById('customModal');
const modalMessage = document.getElementById('modalMessage');

function tampilkanModal(pesan) {
    if(modal && modalMessage) {
        modalMessage.innerHTML = pesan;
        modal.classList.add('active');
    } else {
        alert(pesan);
    }
}

function tutupModal() {
    if(modal) modal.classList.remove('active');
}

// 4. Playground Live Output Logic
const htmlEditor = document.getElementById('html-editor');
const cssEditor = document.getElementById('css-editor');
const jsEditor = document.getElementById('js-editor');
const liveOutput = document.getElementById('live-output');

function updatePlayground() {
    if(!liveOutput) return;
    const htmlCode = htmlEditor.value;
    const cssCode = "<style>" + cssEditor.value + "</style>";
    const jsCode = "<script>" + jsEditor.value + "<\/script>";
    
    liveOutput.srcdoc = htmlCode + cssCode + jsCode;
}

if (htmlEditor && cssEditor && jsEditor) {
    htmlEditor.addEventListener('keyup', updatePlayground);
    cssEditor.addEventListener('keyup', updatePlayground);
    jsEditor.addEventListener('keyup', updatePlayground);
    
    const selector = document.getElementById('templateSelector');
    if (selector) {
        selector.addEventListener('change', updatePlayground);
    }
    
    updatePlayground(); 
}

// 5. Quiz Logic
const quizForm = document.getElementById('quizForm');
if (quizForm) {
    const questions = document.querySelectorAll('.question');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressBar = document.getElementById('quizProgressBar');
    const progressText = document.getElementById('quizProgressText');
    const percentText = document.getElementById('quizPercentText');
    
    let currentQuestionIndex = 0;
    const totalQuestions = questions.length;
    
    function tampilkanSoal(index) {
        // Tampilkan soal aktif, sembunyikan sisanya
        questions.forEach((q, idx) => {
            if (idx === index) {
                q.classList.add('active-question');
            } else {
                q.classList.remove('active-question');
            }
        });
        
        // Update navigasi tombol
        prevBtn.style.display = index === 0 ? 'none' : 'block';
        
        if (index === totalQuestions - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
        
        // Cek apakah soal aktif sudah dijawab
        updateNextButtonState(index);
        
        // Update bar kemajuan kuis
        const percent = Math.round(((index + 1) / totalQuestions) * 100);
        progressBar.style.width = percent + '%';
        progressText.textContent = `Soal ${index + 1} dari ${totalQuestions}`;
        percentText.textContent = `${percent}% Selesai`;
    }
    
    function updateNextButtonState(index) {
        const checkedOption = questions[index].querySelector('input[type="radio"]:checked');
        if (index === totalQuestions - 1) {
            submitBtn.disabled = !checkedOption;
        } else {
            nextBtn.disabled = !checkedOption;
        }
    }
    
    function navigasiSoal(arah) {
        const targetIndex = currentQuestionIndex + arah;
        if (targetIndex >= 0 && targetIndex < totalQuestions) {
            currentQuestionIndex = targetIndex;
            tampilkanSoal(currentQuestionIndex);
        }
    }
    
    // Bind aksi klik tombol navigasi
    prevBtn.addEventListener('click', () => navigasiSoal(-1));
    nextBtn.addEventListener('click', () => navigasiSoal(1));
    
    // Event listener untuk pilihan jawaban (Manual next oleh pengguna)
    questions.forEach((questionDiv, index) => {
        const radios = questionDiv.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                // Aktifkan tombol navigasi setelah pengguna memilih
                updateNextButtonState(index);
            });
        });
    });
    
    // Inisialisasi tampilan soal pertama
    tampilkanSoal(currentQuestionIndex);
    
    // Submit Form (Kalkulasi Nilai Akhir)
    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let score = 0;
        
        // Kunci Jawaban Kuis 20 Soal
        const answers = { 
            q1: 'a', q2: 'b', q3: 'a', q4: 'b', q5: 'b',
            q6: 'b', q7: 'b', q8: 'b', q9: 'b', q10: 'b',
            q11: 'b', q12: 'a', q13: 'b', q14: 'a', q15: 'c',
            q16: 'b', q17: 'a', q18: 'a', q19: 'b', q20: 'b'
        };
        
        let unanswered = [];
        
        for (let key in answers) {
            const selected = quizForm.elements[key];
            if (selected) {
                let checkedVal = "";
                if (selected instanceof NodeList || selected.length > 0) {
                    for (let i = 0; i < selected.length; i++) {
                        if (selected[i].checked) {
                            checkedVal = selected[i].value;
                            break;
                        }
                    }
                } else if (selected.checked) {
                    checkedVal = selected.value;
                }
                
                if (checkedVal === "") {
                    unanswered.push(key.replace('q', ''));
                } else if (checkedVal === answers[key]) {
                    score++;
                }
            }
        }
        
        if (unanswered.length > 0) {
            tampilkanModal(`Pemberitahuan: Anda belum menjawab soal nomor: ${unanswered.join(', ')}. Silakan lengkapi terlebih dahulu!`);
        } else {
            const percentage = Math.round((score / totalQuestions) * 100);
            tampilkanModal(`Kuis Selesai!<br><br>Skor Anda: <b>${score} / ${totalQuestions}</b> (${percentage}%)<br><br>Terus tingkatkan pemahaman belajar Anda dalam pemrograman dasar web!`);
        }
    });
}