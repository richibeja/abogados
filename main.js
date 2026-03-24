document.addEventListener('DOMContentLoaded', () => {

    // --- Modal Logic ---
    window.openModal = (destination) => {
        const overlay = document.getElementById('modal-container');
        const modal = document.getElementById(`modal-${destination}`);

        if (overlay && modal) {
            overlay.classList.add('active');
            // Hide all other modals first (safety)
            document.querySelectorAll('.modal-content').forEach(m => {
                m.style.display = 'none';
                m.classList.remove('active-modal');
            });
            // Show specific
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('active-modal');
            }, 10); // Tiny delay for transition
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    };

    window.closeModal = (event, force = false) => {
        if (force || event.target.id === 'modal-container') {
            const overlay = document.getElementById('modal-container');
            overlay.classList.remove('active');
            document.querySelectorAll('.modal-content').forEach(m => {
                m.classList.remove('active-modal');
                setTimeout(() => m.style.display = 'none', 300);
            });
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    };

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // --- Form Logic ---
    window.nextStep = (currentStepId) => {
        const currentStep = document.getElementById(`step${currentStepId}`);

        // Basic Validation
        const inputs = currentStep.querySelectorAll('input, select');
        let isValid = true;
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                isValid = false;
                input.style.borderColor = '#ef4444'; // Red error

                // Remove error style on input
                input.addEventListener('input', function () {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }, { once: true });
            }
        });

        if (!isValid) {
            alert('Por favor completa todos los campos requeridos antes de continuar.');
            return;
        }

        // Hide current, show next
        currentStep.classList.remove('active');
        const nextStepId = currentStepId + 1;
        const nextStep = document.getElementById(`step${nextStepId}`);
        if (nextStep) {
            nextStep.classList.add('active');
        }

        // Update progress text if exists (optional)
        const headerText = document.querySelector('.form-header p');
        if (headerText) headerText.innerText = `Paso ${nextStepId} de 3`;
    };

    window.prevStep = (currentStepId) => {
        const currentStep = document.getElementById(`step${currentStepId}`);
        currentStep.classList.remove('active');

        const prevStepId = currentStepId - 1;
        const prevStep = document.getElementById(`step${prevStepId}`);
        if (prevStep) {
            prevStep.classList.add('active');
        }

        const headerText = document.querySelector('.form-header p');
        if (headerText) headerText.innerText = `Paso ${prevStepId} de 3`;
    };

    // --- Form Submission ---
    const leadForm = document.getElementById('leadForm');
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect Data
        const formData = new FormData(leadForm);
        const data = Object.fromEntries(formData.entries());

        // Simulate sending data (console log for now)
        console.log('Lead Data:', data);

        // Generate Unique Tracking Code
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const trackingCode = `DLU-${timestamp}-${random}`;

        // ---- PERSISTENCE FOR ADMIN PANEL ----
        const currentCases = JSON.parse(localStorage.getItem('dlu_cases_v2') || '[]');
        currentCases.unshift({
            caseId: trackingCode,
            name: data.name,
            phone: data.phone,
            email: data.email || 'No proporcionado',
            age: data.age,
            company: data.company,
            type: data.claim_type || 'Laboral',
            status: '1', 
            compensation: '$0',
            notes: 'Caso iniciado desde la web principal. Pendiente de revisiÃƒÂ³n de pruebas gratuita.',
            payment: { pending: false, amount: '' },
            docs: {
                id: false,
                cheques: !!data.photo, // If they uploaded something
                contrato: false,
                carta: false,
                medical: data.claim_type === 'Accidente'
            },
            date: new Date().toLocaleDateString('es-ES')
        });
        localStorage.setItem('dlu_cases_v2', JSON.stringify(currentCases));
        // -------------------------------------

        // Show Loading State
        const submitBtn = leadForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO EXPEDIENTE...';

        // Add tracking code to form data
        formData.append('case_tracking_code', trackingCode);

        // SEND DATA TO FORMSPREE (Using official email as endpoint)
        fetch('https://formspree.io/juliethramirez415@gmail.com', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // Show Success Message with Code
                leadForm.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 style="color: #fff; margin-bottom: 0.5rem;">Expediente Enviado con Ãƒâ€°xito</h3>
                        <p style="color: #94a3b8; margin-bottom: 1.5rem;">Excelente ${data.name}. Hemos recibido tus pruebas. Nuestro equipo jurÃƒÂ­dico revisarÃƒÂ¡ tu informaciÃƒÂ³n sin costo para verificar la viabilidad total de realizar una reclamaciÃƒÂ³n federal.</p>
                        
                        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid var(--primary); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
                            <p style="color: #fff; margin-bottom: 0.5rem; font-size: 0.9rem;">CÃƒâ€œDIGO DE SEGUIMIENTO:</p>
                            <div style="font-size: 2rem; font-weight: 800; color: var(--primary); letter-spacing: 2px;">${trackingCode}</div>
                            <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.5rem;">
                                <i class="fas fa-shield-alt"></i> Proceso supervisado legalmente.
                            </p>
                        </div>
        
                        <p style="color: #94a3b8; font-size: 0.9rem;">Guarda este cÃƒÂ³digo. Uno de nuestros abogados asociados lo solicitarÃƒÂ¡ para iniciar tu trÃƒÂ¡mite oficial.</p>
                        
                        <button onclick="location.reload()" class="btn-primary" style="margin-top: 2rem;">Volver al Inicio</button>
                    </div>
                `;
            } else {
                alert('Hubo un error al enviar el expediente. Por favor intenta de nuevo.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Error de conexiÃƒÂ³n. Intente nuevamente.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    });

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- FAQ Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.fas');

            // Toggle current
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            } else {
                answer.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        });
    });

    // --- Compensation Calculator Logic ---
    window.calculateCompensation = (e) => {
        e.preventDefault();
        const rate = parseFloat(document.getElementById('hourlyRate').value);
        const hours = parseFloat(document.getElementById('hoursPerWeek').value);
        const years = parseFloat(document.getElementById('yearsWorked').value);
        const type = document.getElementById('claimType').value;

        // Base calculation: Annual salary * years
        let base = rate * hours * 52 * years;
        let factor = 0.1; 

        // Optimized Factors for Labor Claims (Federal Max Averages)
        if (type === 'dismissal') factor = 0.95; // 95% of total salary (Unjustified + Punitive)
        if (type === 'unpaid') factor = 1.6;  // 160% (Double Damages + Penalties)
        if (type === 'accident') factor = 1.45; // 145% (Medical + Loss of future earnings)

        const estimated = base * factor;
        const min = Math.round(estimated * 0.95 / 500) * 500; 
        const max = Math.round(estimated * 2.1 / 500) * 500;

        document.getElementById('minAmount').innerText = min.toLocaleString();
        document.getElementById('maxAmount').innerText = max.toLocaleString();
        document.getElementById('calcResult').style.display = 'block';
        
        const potentialMsg = document.getElementById('potentialMsg');
        if (max > 20000) {
            potentialMsg.innerHTML = "Ã‚Â¡SU CASO ES DE ALTO IMPACTO! PodrÃƒÂ­a recuperar hasta <strong>$" + max.toLocaleString() + "</strong>. Hable con un asesor ahora.";
            potentialMsg.style.color = "#10b981";
        } else {
            potentialMsg.innerHTML = "Candidato ideal para reclamaciÃƒÂ³n legal protegida.";
            potentialMsg.style.color = "#3b82f6";
        }

        // --- Proactive Tammy Trigger (CONVERSION FLOW) ---
        setTimeout(() => {
            const tammyBubble = document.getElementById('v3-main-bubble');
            const tammyNotif = document.getElementById('v3-notif-pill');
            const tammyTooltip = document.getElementById('v3-bot-tooltip');
            
            if (tammyBubble && tammyNotif) {
                tammyNotif.innerText = "1";
                tammyNotif.style.display = "flex";
                if(tammyTooltip) {
                    tammyTooltip.innerHTML = '<i class="fas fa-hand-holding-usd" style="color:#0B1F4D;"></i> Ã‚Â¡Tu caso vale mucho dinero! Click aquÃƒÂ­ para iniciar el trÃƒÂ¡mite.';
                    tammyTooltip.style.background = "#10b981"; // Cambiar a verde de ÃƒÂ©xito
                    tammyTooltip.style.borderColor = "#10b981";
                    tammyTooltip.style.color = "white";
                }
                
                // Add a little vibration effect
                tammyBubble.style.animation = "v3-shake 0.5s ease-in-out infinite";
                setTimeout(() => tammyBubble.style.animation = "none", 4000);
            }
        }, 1500);
    };

    // --- AI Assistant ("Operadora") Logic ---
    let aiStep = 0;
    const aiMessages = [
        "Ã‚Â¡Hola! Soy tu asistente legal. Ã‚Â¿Te despidieron o no te pagaron?",
        "Entiendo. No importa tu estatus, tienes derechos. Ã‚Â¿Tienes pruebas como fotos o mensajes?",
        "Perfecto. Usa la calculadora arriba para ver cuÃƒÂ¡nto podrÃƒÂ­as ganar, o llena el formulario para hablar con un abogado ahora."
    ];

    window.toggleAIAssistant = () => {
        const bubble = document.getElementById('ai-bubble');
        const isVisible = bubble.style.display === 'block';
        
        if (!isVisible) {
            bubble.style.display = 'block';
            updateAIText();
        } else {
            bubble.style.display = 'none';
        }
    };

    function updateAIText() {
        const textEl = document.getElementById('ai-text');
        textEl.innerText = aiMessages[aiStep % aiMessages.length];
        aiStep++;
    }

    window.readAloud = () => {
        const text = document.getElementById('ai-text').innerText;
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-US';
            utterance.rate = 0.9; // Slightly slower for better understanding
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Tu navegador no soporta lectura de voz.");
        }
    };

    // Handle Job Requests
    window.handleJobRequest = (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = document.getElementById("jobSubmitBtn");
        
        const data = {
            name: document.getElementById("jobName").value,
            phone: document.getElementById("jobPhone").value,
            state: document.getElementById("jobState").value,
            skill: document.getElementById("jobSkill").value,
            date: new Date().toLocaleDateString("es-ES")
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> PROCESANDO...";
        }

        const jobRequests = JSON.parse(localStorage.getItem("dlu_job_requests") || "[]");
        jobRequests.unshift(data);
        localStorage.setItem("dlu_job_requests", JSON.stringify(jobRequests));

        const formData = new FormData(form);
        formData.append("subject", `NUEVA ALERTA EMPLEO: ${data.name} (${data.state})`);

        fetch("https://formspree.io/f/mpzvbjra", { 
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        }).finally(() => {
            document.getElementById("jobForm").style.display = "none";
            document.getElementById("jobSuccess").style.display = "block";
            
            if (!document.getElementById("waConfirmBtn")) {
                                const waLink = `https://wa.me/18053080769?text=${encodeURIComponent("¡Hola Defensa Laboral USA! 👋 Acabo de registrarme para las Alertas de Empleo Prioritarias en " + data.state + ".\n\n👤 Mi Nombre: " + data.name + "\n🛠️ Mi Oficio: " + data.skill + "\n\nPor favor, activen mi código de seguimiento para recibir vacantes verificadas y asegurar que mi perfil esté en su base de datos oficial. ¡Quedo atento(a)! ✅")}`;
                const waBtn = document.createElement("a");
                waBtn.id = "waConfirmBtn";
                waBtn.href = waLink;
                waBtn.target = "_blank";
                waBtn.className = "btn-primary";
                waBtn.style.background = "#25D366";
                waBtn.style.marginTop = "1.5rem";
                waBtn.style.display = "inline-flex";
                waBtn.style.alignItems = "center";
                waBtn.style.gap = "10px";
                waBtn.style.width = "100%";
                waBtn.style.justifyContent = "center";
                waBtn.innerHTML = "<i class=\"fab fa-whatsapp\"></i> CONFIRMAR POR WHATSAPP";
                
                document.getElementById("jobSuccess").appendChild(waBtn);
            }
        });
    };

});

/* --- Agentic AI Hub (Premium Features) --- */
let isHubOpen = false;
let currentAgent = 'Lawyer';
let isSpeaking = false;

window.toggleAIHub = () => {
    isHubOpen = !isHubOpen;
    const panel = document.getElementById('aiPanel');
    const trigger = document.getElementById('aiTrigger');
    const notif = document.getElementById('aiNotif');

    if (isHubOpen) {
        panel.style.display = 'flex';
        notif.style.display = 'none';
        trigger.style.animation = 'none';
    } else {
        panel.style.display = 'none';
    }
};

window.switchAgent = (type) => {
    currentAgent = type;
    const welcomeMsg = document.getElementById('aiWelcomeMsg');
    
    // UI Update
    document.querySelectorAll('.agent-bubble').forEach(b => b.style.borderColor = 'transparent');
    document.getElementById(`agent${type}`).style.borderColor = 'var(--primary)';

    const agents = {
        'Lawyer': 'Hola. Soy el <strong>Abogado Virtual</strong>. Â¿En quÃ© estado de USA te encuentras?',
        'Financial': 'Soy el <strong>Liquidador Federal</strong>. Puedo auditar tu cheque de pago ahora mismo. Â¿CuÃ¡nto ganas por hora?',
        'Jobs': 'Hola. Soy el <strong>Reclutador</strong>. Busco vacantes en Florida y California. Â¿QuÃ© oficio sabes hacer?'
    };

    welcomeMsg.innerHTML = agents[type];
    
    // Sound effect (optional if we had one)
    if('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(welcomeMsg.innerText);
        utterance.lang = 'es-US';
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    }
};

window.toggleVoiceAI = () => {
    const mic = document.getElementById('micBtn');
    const status = document.getElementById('voiceStatus');
    const chatArea = document.getElementById('aiChat');
    
    if (!isSpeaking) {
        isSpeaking = true;
        mic.classList.add('active');
        status.innerText = 'ESCUCHANDO EXPLICACIÃ“N...';
        
        // Simulating transcription
        setTimeout(() => {
            if(isSpeaking) {
                const userMsg = document.createElement('div');
                userMsg.className = 'ai-msg user';
                userMsg.innerText = 'Hola, necesito saber si mi despido fue legal. Mi jefe dijo que no hay dinero.';
                chatArea.appendChild(userMsg);
                chatArea.scrollTop = chatArea.scrollHeight;
                
                stopVoiceAI('Entendido. El pretexto de "falta de fondos" no elude los salarios mÃ­nimos federales. Evaluando Ley de EstÃ¡ndares Laborales Justos (FLSA)...');
            }
        }, 3000);
    } else {
        stopVoiceAI();
    }
};

function stopVoiceAI(botResponse = null) {
    const mic = document.getElementById('micBtn');
    const status = document.getElementById('voiceStatus');
    const chatArea = document.getElementById('aiChat');
    
    isSpeaking = false;
    mic.classList.remove('active');
    status.innerText = 'CLIC PARA HABLAR';

    if (botResponse) {
        const botMsg = document.createElement('div');
        botMsg.className = 'ai-msg bot';
        botMsg.innerHTML = `<i class="fas fa-microchip"></i> ${botResponse}`;
        chatArea.appendChild(botMsg);
        chatArea.scrollTop = chatArea.scrollHeight;
        
        // Speak response
        if('speechSynthesis' in window) {
             const utterance = new SpeechSynthesisUtterance(botResponse);
             utterance.lang = 'es-US';
             window.speechSynthesis.speak(utterance);
        }
    }
}

/* --- Trend 5: Multi-Agent Audit Logic --- */
window.runMultiAgentAudit = () => {
    const auditContainer = document.createElement('div');
    auditContainer.className = 'audit-timeline';
    auditContainer.id = 'active-audit';
    
    // Insert after the button in calculator
    const calcResult = document.getElementById('calcResult');
    if (calcResult) calcResult.prepend(auditContainer);

    const steps = [
        { icon: 'gavel', title: 'Agente JurÃ­dico', desc: 'Verificando normativas de California (SB 1006)...' },
        { icon: 'shield-alt', title: 'Agente de InvestigaciÃ³n', desc: 'Buscando precedentes federales similares...' },
        { icon: 'landmark', title: 'Agente de TesorerÃ­a', desc: 'Calculando multas punitivas por mora...' }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
        if(stepIdx < steps.length) {
            const item = document.createElement('div');
            item.className = 'timeline-item fade-in';
            item.innerHTML = `
                <div class="timeline-icon"><i class="fas fa-${steps[stepIdx].icon}"></i></div>
                <div class="timeline-content">
                    <h5>${steps[stepIdx].title}</h5>
                    <p>${steps[stepIdx].desc}</p>
                </div>
            `;
            auditContainer.appendChild(item);
            stepIdx++;
        } else {
            clearInterval(interval);
            const final = document.createElement('div');
            final.style = "text-align:center; padding: 10px; border-top: 1px dashed var(--primary); margin-top: 10px;";
            final.innerHTML = `<span style="color:var(--accent); font-weight:800;"><i class="fas fa-check-double"></i> AUDITORÃA COMPLETADA POR EL EQUIPO IA</span>`;
            auditContainer.appendChild(final);
        }
    }, 1500);
};

// Update calculateCompensation to trigger audit
const originalCalc = window.calculateCompensation;
window.calculateCompensation = (e) => {
    // Show audit first as in Trend 5
    const existingAudit = document.getElementById('active-audit');
    if (existingAudit) existingAudit.remove();
    
    runMultiAgentAudit();
    
    // Run original calc after a delay to simulate "thinking"
    setTimeout(() => {
        originalCalc(e);
    }, 1000);
};

