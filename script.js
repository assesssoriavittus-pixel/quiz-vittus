// ===========================
// VITTUS QUIZ — LOGIC
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.quiz-step');
    const progressBar = document.getElementById('progressBar');
    const totalSteps = 3;
    let currentStep = 1;
    const answers = {};

    // Initialize progress bar
    updateProgressBar();

    // Attach click listeners to all options
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function () {
            const step = this.closest('.quiz-step');
            const stepNum = parseInt(step.dataset.step);
            const input = this.querySelector('input[type="radio"]');

            // Deselect all options in this step
            step.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Select clicked option
            this.classList.add('selected');
            input.checked = true;

            // Store answer
            answers[`q${stepNum}`] = input.value;

            // Auto-advance after a short delay
            setTimeout(() => {
                goToStep(stepNum + 1);
            }, 400);
        });
    });

    function goToStep(step) {
        if (step < 1 || step > totalSteps + 1) return;

        const currentEl = document.querySelector('.quiz-step.active');
        const nextEl = document.querySelector(`.quiz-step[data-step="${step}"]`);

        if (!currentEl || !nextEl) return;

        // Animate out current step
        currentEl.classList.add('slide-out');
        currentEl.classList.remove('active');

        setTimeout(() => {
            currentEl.classList.remove('slide-out');
            currentEl.style.display = 'none';

            // Show next step
            nextEl.style.display = 'block';
            nextEl.classList.add('active');

            currentStep = step;
            updateProgressBar();

            // If result step, show loading then result
            if (step === totalSteps + 1) {
                showResult();
            }
        }, 300);
    }

    function updateProgressBar() {
        if (!progressBar) return;
        const progress = ((currentStep - 1) / totalSteps) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    function showResult() {
        // Progress bar full
        if (progressBar) progressBar.style.width = '100%';

        // Log answers (can be sent to backend)
        console.log('Quiz Answers:', answers);

        // Salvar respostas do quiz no localStorage para enviar junto com o agendamento
        localStorage.setItem('quizAnswers', JSON.stringify(answers));

        // Override CTA click to redirect to scheduling page (in case they click before auto-redirect)
        const resultBtn = document.querySelector('.quiz-step[data-step="4"] .cta-button');
        if (resultBtn) {
            resultBtn.href = "agendamento.html";
        }

        // AUTO REDIRECT
        setTimeout(() => {
            window.location.href = 'agendamento.html';
        }, 2500); // Aguarda 2.5 segundos e redireciona sozinho
    }

    // Global back function
    window.goBack = function () {
        if (currentStep <= 1) return;

        const currentEl = document.querySelector('.quiz-step.active');
        const prevStep = currentStep - 1;
        const prevEl = document.querySelector(`.quiz-step[data-step="${prevStep}"]`);

        if (!currentEl || !prevEl) return;

        currentEl.classList.remove('active');
        currentEl.style.display = 'none';

        prevEl.style.display = 'block';
        prevEl.classList.add('active');

        currentStep = prevStep;
        updateProgressBar();
    };

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Backspace') {
            if (currentStep > 1 && currentStep <= totalSteps) {
                e.preventDefault();
                window.goBack();
            }
        }

        // Number keys to select options
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            const activeStep = document.querySelector('.quiz-step.active');
            if (activeStep) {
                const options = activeStep.querySelectorAll('.option');
                if (num <= options.length) {
                    options[num - 1].click();
                }
            }
        }
    });

    // ===========================
    // FAQ LOGIC (Agendamento Page)
    // ===========================
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            
            // Close other items (Accordion behavior)
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current
            item.classList.toggle('active');
        });
    });

    // ===========================
    // CALENDAR INTERACTIVE LOGIC
    // ===========================
    const viewCalendar = document.getElementById('view-calendar');
    const viewTimes = document.getElementById('view-times');
    const viewForm = document.getElementById('view-form');
    
    if (viewCalendar) {
        let currentDate = new Date();
        const bookedMockData = []; // Armazena os agendamentos da sessão atual

        const calendarDays = document.getElementById('calendar-days');
        const monthYearDisplay = document.getElementById('calendar-month-year');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');

        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

        let selectedFullDate = null;
        let selectedTime = null;

        function renderCalendar() {
            const headers = `<span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>`;
            calendarDays.innerHTML = headers;

            monthYearDisplay.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            let startDayIndex = firstDay.getDay() - 1;
            if (startDayIndex === -1) startDayIndex = 6;

            for (let i = 0; i < startDayIndex; i++) {
                calendarDays.innerHTML += `<span></span>`;
            }

            const today = new Date();
            // Só permite agendar a partir de amanhã
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0,0,0,0);
            
            for (let i = 1; i <= lastDay.getDate(); i++) {
                const daySpan = document.createElement('span');
                daySpan.textContent = i;
                
                const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                thisDate.setHours(0,0,0,0);
                
                const isWeekend = thisDate.getDay() === 0 || thisDate.getDay() === 6;
                
                if (thisDate >= tomorrow && !isWeekend) {
                    daySpan.classList.add('day-active');
                    daySpan.style.cursor = 'pointer';
                    daySpan.style.color = '#3b82f6'; // Azul para dias disponíveis
                    daySpan.style.fontWeight = 'bold'; // Deixa mais evidente
                    daySpan.addEventListener('click', () => handleDayClick(i));
                } else {
                    daySpan.style.color = '#52525b'; // Cinza para indisponíveis/passados
                    daySpan.style.cursor = 'not-allowed';
                }

                // Marca dia atual visualmente
                if (thisDate.getDate() === today.getDate() && thisDate.getMonth() === today.getMonth() && thisDate.getFullYear() === today.getFullYear()) {
                    daySpan.style.textDecoration = 'underline';
                    daySpan.style.textUnderlineOffset = '4px';
                }

                calendarDays.appendChild(daySpan);
            }
        }

        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });
        }

        function handleDayClick(day) {
            selectedFullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            
            document.getElementById('selected-date-display').textContent = weekdays[selectedFullDate.getDay()];
            document.getElementById('selected-date-sub').textContent = `${months[selectedFullDate.getMonth()]} ${day}, ${selectedFullDate.getFullYear()}`;

            const timesList = document.getElementById('times-list');
            timesList.innerHTML = '';
            // Mock de horários entre 10h e 18h
            const mockTimes = ['10:00 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];
            const today = new Date();
            const isToday = selectedFullDate.getDate() === today.getDate() && 
                            selectedFullDate.getMonth() === today.getMonth() && 
                            selectedFullDate.getFullYear() === today.getFullYear();
                            
            const currentHour = today.getHours();
            const currentMinutes = today.getMinutes();

            const availableTimes = mockTimes.filter(time => {
                const dateTimeStr = selectedFullDate.toDateString() + ' ' + time;
                if (bookedMockData.includes(dateTimeStr)) return false; // Remove se já foi agendado

                if (!isToday) return true;
                
                let [hoursStr, minutesStr] = time.replace(' PM', '').replace(' AM', '').split(':');
                let h = parseInt(hoursStr);
                if (time.includes('PM') && h < 12) h += 12;
                if (time.includes('AM') && h === 12) h = 0;
                
                if (h > currentHour) return true;
                if (h === currentHour && parseInt(minutesStr) > currentMinutes) return true;
                return false;
            });
            
            if (availableTimes.length === 0) {
                timesList.innerHTML = '<p style="text-align:center; color:#ef4444; margin-top:20px;">Nenhum horário disponível para hoje.</p>';
            } else {
                availableTimes.forEach(time => {
                    const btn = document.createElement('button');
                    btn.className = 'time-btn';
                    btn.textContent = time;
                    btn.onclick = () => window.selectTime(time);
                    timesList.appendChild(btn);
                });
            }

            switchView(viewCalendar, viewTimes);
        }

        window.selectTime = function(time) {
            selectedTime = time;
            
            // Format 30 min diff
            let [hoursStr, minutesStr, ampm] = time.replace(' PM', '').replace(' AM', '').split(':');
            let h = parseInt(hoursStr);
            let m = parseInt(minutesStr);
            let isPM = time.includes('PM');
            
            m += 30;
            if (m >= 60) {
                h += 1;
                m -= 60;
                if (h === 12) isPM = !isPM;
                if (h > 12) h -= 12;
            }
            
            let endStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
                                
            const finalDateStr = `${time} - ${endStr} , ${weekdays[selectedFullDate.getDay()].substring(0,3)}, ${selectedFullDate.getDate()} De ${months[selectedFullDate.getMonth()].substring(0,3)} De ${selectedFullDate.getFullYear()}`;
            
            document.getElementById('final-date-time').textContent = finalDateStr;

            switchView(viewTimes, viewForm);
        };

        window.calendarGoBack = function(toView) {
            if (toView === 'calendar') {
                switchView(viewTimes, viewCalendar);
            } else if (toView === 'times') {
                switchView(viewForm, viewTimes);
            }
        };

        function switchView(fromEl, toEl) {
            fromEl.classList.add('fade-out');
            setTimeout(() => {
                fromEl.style.display = 'none';
                fromEl.classList.remove('fade-out');
                
                toEl.style.display = 'block';
                toEl.classList.add('fade-in');
                setTimeout(() => {
                    toEl.classList.remove('fade-in');
                }, 300);
            }, 300);
        }

        document.getElementById('booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('b-name').value;
            const phone = document.getElementById('b-phone').value;
            
            // Link do Webhook do Make.com
            const WEBHOOK_URL = "https://hook.us2.make.com/jzazjelvhr81odkf3loe5l73l5ssatud";

            // Recuperar respostas do quiz salvas no localStorage
            const quizAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '{}');

            // Mapear valores das respostas para textos legíveis
            const objetivoMap = {
                'escalar': 'Escalar as vendas com previsibilidade',
                'depender': 'Depender menos de mim e de indicações',
                'estruturar': 'Estruturar ou reestruturar o time de vendas',
                'converter': 'Converter melhor o que já entra'
            };
            const segmentoMap = {
                'consultoria': 'Consultoria, assessoria ou serviço de alto valor',
                'advocacia': 'Advocacia, contabilidade ou saúde',
                'educacao': 'Educação, mentoria ou infoproduto',
                'seguros': 'Seguros, consórcio ou financeiro',
                'industria': 'Indústria ou distribuição',
                'varejo': 'Varejo ou loja física',
                'commodity': 'Commodity (o cliente decide pelo preço)',
                'governo': 'Venda para o governo (licitação)'
            };
            const papelMap = {
                'dono': 'Dono ou fundador',
                'socio': 'Sócio',
                'diretor': 'Diretor(a)',
                'gestor': 'Gestor comercial',
                'outro': 'Outro'
            };

            const payload = {
                data: selectedFullDate.toLocaleDateString('pt-BR'),
                horario: selectedTime,
                nome: name,
                whatsapp: phone,
                objetivo_comercial: objetivoMap[quizAnswers.q1] || quizAnswers.q1 || '',
                segmento: segmentoMap[quizAnswers.q2] || quizAnswers.q2 || '',
                papel_na_empresa: papelMap[quizAnswers.q3] || quizAnswers.q3 || ''
            };

            // Envia os dados para o Make.com (se o link estiver preenchido)
            if (WEBHOOK_URL !== "SUA_URL_DO_MAKE_AQUI") {
                console.log('--- ENVIANDO AGENDAMENTO ---', JSON.stringify(payload, null, 2));
                fetch(WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                .then(res => console.log("Webhook enviado com sucesso!", res.status))
                .catch(err => console.error("Erro ao enviar webhook:", err));
            } else {
                console.log('--- NOVO AGENDAMENTO (MOCK / WEBHOOK NÃO CONFIGURADO) ---', payload);
            }
            
            bookedMockData.push(selectedFullDate.toDateString() + ' ' + selectedTime);
            
            // Troca o form por uma mensagem de sucesso na própria tela
            viewForm.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                    <h2 style="color: #4ade80; margin-bottom: 15px;">Agendamento concluído com sucesso!</h2>
                    <p style="font-size: 16px; margin-bottom: 25px;">Sua vaga para o dia <strong>${selectedFullDate.toLocaleDateString()}</strong> às <strong>${selectedTime}</strong> está reservada.</p>
                    
                    <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid var(--accent); padding: 15px; border-radius: 8px;">
                        <strong style="color: var(--accent);">⚠️ AVISO IMPORTANTE:</strong>
                        <p style="font-size: 14px; margin-top: 8px;">Nossa equipe entrará em contato com você pelo WhatsApp informado. <strong>Se você não responder para confirmar sua presença, você perderá o horário</strong> e a vaga será repassada para o próximo selecionado.</p>
                    </div>
                    
                    <button class="cta-button" style="margin-top: 30px; width: 100%;" onclick="document.getElementById('view-form').style.display='none'; document.getElementById('view-calendar').style.display='block';">Entendido, voltar ao início</button>
                </div>
            `;
        });

        // Initialize calendar
        renderCalendar();
    }
});
