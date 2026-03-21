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
            notes: 'Caso iniciado desde la web principal.',
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

        // Show Success Message with Code
        leadForm.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Expediente Iniciado</h3>
                <p style="color: #94a3b8; margin-bottom: 1.5rem;">Excelente ${data.name}. Se ha generado tu código DLU. Para activar la investigación y defensa legal, se requiere el pago de honorarios de apertura.</p>
                
                <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid var(--primary); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
                    <p style="color: #fff; margin-bottom: 0.5rem; font-size: 0.9rem;">CÓDIGO DE SEGUIMIENTO:</p>
                    <div style="font-size: 2rem; font-weight: 800; color: var(--primary); letter-spacing: 2px;">${trackingCode}</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.5rem;">
                        <i class="fas fa-shield-alt"></i> Proceso supervisado legalmente.
                    </p>
                </div>

                <p style="color: #94a3b8; font-size: 0.9rem;">Guarda este código. Uno de nuestros abogados asociados lo solicitará para iniciar tu trámite.</p>
                
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 2rem;">Volver al Inicio</button>
            </div>
        `;
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
            potentialMsg.innerHTML = "¡SU CASO ES DE ALTO IMPACTO! Podría recuperar hasta <strong>$" + max.toLocaleString() + "</strong>. Hable con un asesor ahora.";
            potentialMsg.style.color = "#10b981";
        } else {
            potentialMsg.innerHTML = "Candidato ideal para reclamación legal protegida.";
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
                    tammyTooltip.innerHTML = '<i class="fas fa-hand-holding-usd" style="color:#0B1F4D;"></i> ¡Tu caso vale mucho dinero! Click aquí para iniciar el trámite.';
                    tammyTooltip.style.background = "#10b981"; // Cambiar a verde de éxito
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
        "¡Hola! Soy tu asistente legal. ¿Te despidieron o no te pagaron?",
        "Entiendo. No importa tu estatus, tienes derechos. ¿Tienes pruebas como fotos o mensajes?",
        "Perfecto. Usa la calculadora arriba para ver cuánto podrías ganar, o llena el formulario para hablar con un abogado ahora."
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
        const data = {
            name: document.getElementById('jobName').value,
            phone: document.getElementById('jobPhone').value,
            state: document.getElementById('jobState').value,
            skill: document.getElementById('jobSkill').value,
            date: new Date().toLocaleDateString()
        };

        // Save to a separate localStorage key for Admin
        const jobRequests = JSON.parse(localStorage.getItem('dlu_job_requests') || '[]');
        jobRequests.unshift(data);
        localStorage.setItem('dlu_job_requests', JSON.stringify(jobRequests));

        document.getElementById('jobForm').style.display = 'none';
        document.getElementById('jobSuccess').style.display = 'block';
    };

});
