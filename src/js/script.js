document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
        "hop",
        "M0,0 C0.488,0.082 0.467,0.286 0.5,0.5 0.532,0.712 0.561,1 1,1"
    );

    const progressCircle = document.querySelector(".progress-circle-fill");
    const slider = document.querySelector(".slider");
    // ALTERAÇÃO: O script agora vai funcionar mesmo se sliderTitle for nulo
    const sliderTitle = document.querySelector(".slider-title"); 
    const sliderCounter = document.querySelector(
        ".slider-counter p span:first-child"
    );
    const sliderItems = document.querySelector(".slider-items");
    const sliderPreview = document.querySelector(".slider-preview");
    
    const totalSlides = 6;
    let activeSlideIndex = 1;
    let isAnimating = false;
    let autoplayTimer = null;
    const autoplayDelay = 5000;

    const sliderContent = [
        { name: "Dia das Mulheres", img: "../assets/homepage/slider/diaDasMulheres.png", link: "#mulheres" },
        { name: "Novo E-Commerce APPM", img: "../assets/homepage/slider/catalogo.png", link: "#ecommerce" },
        { name: "Conscientização Setembro", img: "../assets/homepage/slider/setembroAmarelo.png", link: "#setembro" },
        { name: "Dia do Autista", img: "../assets/homepage/slider/consciAutismo.jpg", link: "#autista" },
        { name: "Gincana 2025", img: "../assets/homepage/slider/gincana.jpg", link: "#gincana" },
        { name: "Projetos para o Mundo", img: "../assets/homepage/slider/aquisicoesAAPM.png", link: "#projetos" },
    ];

    const clipPath = {
        closed: "polygon(25% 30%, 75% 30%, 75% 70%, 25% 70%)",
        open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    };

    const slidePositions = {
        prev: { left: "15%", rotation: -90 },
        active: { left: "50%", rotation: 0 },
        next: { left: "85%", rotation: 90 },
    };

    function startAutoplay() {
        if (autoplayTimer) clearTimeout(autoplayTimer);
        gsap.killTweensOf(progressCircle);
        animateProgressCircle();
        autoplayTimer = setTimeout(() => {
            if (!isAnimating) transitionSlides("next");
        }, autoplayDelay);
    }

    function animateProgressCircle() {
        gsap.set(progressCircle, { strokeDashoffset: 113 });
        gsap.to(progressCircle, {
            strokeDashoffset: 0,
            duration: autoplayDelay / 1000,
            ease: "linear"
        });
    }

    function pauseAutoplay() {
        if (autoplayTimer) clearTimeout(autoplayTimer);
    }

    function splitTextIntoSpans(element) {
        element.innerHTML = element.innerText
            .split("")
            .map((char) => `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`)
            .join("");
    }

    // ALTERAÇÃO: A função inteira agora só executa se o sliderTitle existir
    function createAndAnimateTitle(content, direction) {
        if (!sliderTitle) return; // Se a div não existe, a função para aqui.

        const newTitle = document.createElement("h1");
        newTitle.innerText = content.name;
        sliderTitle.appendChild(newTitle);
        splitTextIntoSpans(newTitle);

        const yOffset = direction === "next" ? 60 : -60;
        gsap.set(newTitle.querySelectorAll("span"), { y: yOffset });
        gsap.to(newTitle.querySelectorAll("span"), {
            y: 0, duration: 1.25, stagger: 0.02, ease: "hop", delay: 0.25,
        });

        const currentTitle = sliderTitle.querySelector("h1:not(:last-child)");
        if (currentTitle) {
            gsap.to(currentTitle.querySelectorAll("span"), {
                y: -yOffset, duration: 1.25, stagger: 0.02, ease: "hop", delay: 0.25,
                onComplete: () => currentTitle.remove(),
            });
        }
    }

    function createSlide(content, className) {
        const slide = document.createElement("div");
        slide.className = `slider-container ${className}`;
        slide.innerHTML = `
            <div class="slide-img"><img src="${content.img}" alt="${content.name}"></div>
            <a href="${content.link}" class="continue-button">Continuar</a>
            <div class="slide-label"></div>
        `;
        return slide;
    }

    function getSlideIndex(increment) {
        return ((activeSlideIndex + increment - 1 + totalSlides) % totalSlides) + 1;
    }

    function updateCounterAndHighlight(index) {
        sliderCounter.textContent = index;
        sliderItems.querySelectorAll("p").forEach((item, i) => 
            item.classList.toggle("activeItem", i === index - 1)
        );
    }

    function updatePreviewImage(content) {
        const newImage = document.createElement("img");
        newImage.src = content.img;
        newImage.alt = content.name;
        sliderPreview.appendChild(newImage);

        gsap.fromTo(newImage, { opacity: 0 }, {
            opacity: 1, duration: 1, ease: "power2.inOut", delay: 0.5,
            onComplete: () => {
                const oldImage = sliderPreview.querySelector("img:not(:last-child)");
                if (oldImage) oldImage.remove();
            }
        });
    }
    
    function updateSlideLabel(slide, index, show) {
        if (!slide) return;
        const label = slide.querySelector('.slide-label');
        if (label) {
            if (show) {
                const content = sliderContent[index - 1];
                const formattedIndex = String(index).padStart(2, '0');
                label.innerHTML = `<span>${content.name} / ${formattedIndex}</span>`;
            }
            gsap.to(label, { opacity: show ? 1 : 0, duration: 0.8, delay: show ? 0.5 : 0 });
        }
    }

    function animateSlide(slide, props) {
        if (!slide) return;
        gsap.to(slide, { ...props, duration: 2, ease: "hop" });
        const slideImg = slide.querySelector(".slide-img");
        if (slideImg) {
            gsap.to(slideImg, { rotation: -props.rotation, duration: 2, ease: "hop" });
        }
    }

    function transitionSlides(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const [outgoingPos, incomingPos] = direction === "next" ? ["prev", "next"] : ["next", "prev"];
        const outgoingSlide = slider.querySelector(`.${outgoingPos}`);
        const activeSlide = slider.querySelector(".active");
        const incomingSlide = slider.querySelector(`.${incomingPos}`);

        if (!outgoingSlide || !activeSlide || !incomingSlide) {
            isAnimating = false;
            console.error("Elementos de slide não encontrados");
            return;
        }

        animateSlide(incomingSlide, { ...slidePositions.active, clipPath: clipPath.open });
        animateSlide(activeSlide, { ...slidePositions[outgoingPos], clipPath: clipPath.closed });
        gsap.to(outgoingSlide, { scale: 0, opacity: 0, duration: 1.5, ease: "hop" });

        const newActiveIndex = getSlideIndex(direction === "next" ? 1 : -1);
        const newPrevNextIndex = getSlideIndex(direction === "next" ? 0 : 0);
        const newSlideIndex = getSlideIndex(direction === "next" ? 2 : -2);
        
        const newSlide = createSlide(sliderContent[newSlideIndex - 1], incomingPos);
        slider.appendChild(newSlide);
        
        gsap.set(newSlide, { ...slidePositions[incomingPos], xPercent: -50, yPercent: -50, clipPath: clipPath.closed, opacity: 0, scale: 0 });
        gsap.set(newSlide.querySelector(".slide-img"), { rotation: -slidePositions[incomingPos].rotation });
        gsap.to(newSlide, { scale: 1, opacity: 1, duration: 1.5, ease: "hop" });

        updateSlideLabel(incomingSlide, activeSlideIndex, false);
        updateSlideLabel(activeSlide, newPrevNextIndex, true);
        updateSlideLabel(newSlide, newSlideIndex, true);
        
        createAndAnimateTitle(sliderContent[newActiveIndex - 1], direction);
        updatePreviewImage(sliderContent[newActiveIndex - 1]);

        setTimeout(() => updateCounterAndHighlight(newActiveIndex), 1000);

        setTimeout(() => {
            if (outgoingSlide && outgoingSlide.parentNode) outgoingSlide.remove();
            if (activeSlide) activeSlide.className = `slider-container ${outgoingPos}`;
            if (incomingSlide) incomingSlide.className = "slider-container active";
            if (newSlide) newSlide.className = `slider-container ${incomingPos}`;
            activeSlideIndex = newActiveIndex;
            isAnimating = false;
            startAutoplay();
        }, 2000);
    }

    function initializeSlider() {
        const slideContainers = slider.querySelectorAll('.slider-container');
        slideContainers.forEach(el => el.remove());
        
        const prevIndex = getSlideIndex(-1);
        const activeIndex = activeSlideIndex;
        const nextIndex = getSlideIndex(1);
        
        const prevSlide = createSlide(sliderContent[prevIndex - 1], "prev");
        const activeSlide = createSlide(sliderContent[activeIndex - 1], "active");
        const nextSlide = createSlide(sliderContent[nextIndex - 1], "next");
        
        slider.appendChild(prevSlide);
        slider.appendChild(activeSlide);
        slider.appendChild(nextSlide);
        
        updateSlideLabel(prevSlide, prevIndex, true);
        updateSlideLabel(nextSlide, nextIndex, true);

        Object.entries(slidePositions).forEach(([key, value]) => {
            slider.querySelectorAll(`.slider-container.${key}`).forEach(slideElement => {
                gsap.set(slideElement, {
                    ...value, xPercent: -50, yPercent: -50,
                    clipPath: key === "active" ? clipPath.open : clipPath.closed,
                });
                if (key !== "active") {
                    const imgElement = slideElement.querySelector(".slide-img");
                    if (imgElement) gsap.set(imgElement, { rotation: -value.rotation });
                }
            });
        });
        
        updatePreviewImage(sliderContent[activeIndex - 1]);
        
        // ALTERAÇÃO: Verifica se sliderTitle existe antes de tentar usá-lo
        if (sliderTitle) {
            const newTitle = document.createElement("h1");
            newTitle.innerText = sliderContent[activeIndex - 1].name;
            if(sliderTitle.querySelector("h1")) sliderTitle.querySelector("h1").remove();
            sliderTitle.appendChild(newTitle);
            splitTextIntoSpans(newTitle);
            gsap.fromTo(newTitle.querySelectorAll("span"), { y: 60 }, { y: 0, duration: 1, stagger: 0.02, ease: "hop" });
        }
    }

    slider.addEventListener("click", (e) => {
    // Se a animação estiver ocorrendo, não faz nada.
    if (isAnimating) return;

    // PRIMEIRO, verifica se o clique foi no botão "Continuar".
    if (e.target.closest('.continue-button')) {
        // Se foi, a função para aqui e deixa o navegador seguir o link.
        console.log("Botão 'Continuar' clicado. Navegando...");
        return; 
    }

    // SE NÃO FOI NO BOTÃO, então checa se foi em um slide para trocar.
    const clickedSlide = e.target.closest(".slider-container");
    if (clickedSlide) {
        // Interrompe o autoplay e inicia a transição
        if (autoplayTimer) clearTimeout(autoplayTimer);
        gsap.killTweensOf(progressCircle);
        transitionSlides(clickedSlide.classList.contains("next") ? "next" : "prev");
    }
});

    initializeSlider();
    updateCounterAndHighlight(activeSlideIndex);
    startAutoplay();

    sliderItems.querySelectorAll("p").forEach((item, index) => {
        item.addEventListener("click", () => {
            if (index + 1 !== activeSlideIndex && !isAnimating) {
                if (autoplayTimer) clearTimeout(autoplayTimer);
                gsap.killTweensOf(progressCircle);
                transitionSlides(index + 1 > activeSlideIndex ? "next" : "prev");
            }
        });
    });
});