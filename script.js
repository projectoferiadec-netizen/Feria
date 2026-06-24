// CONFIGURACIÓN DE SUPABASE: Reemplazá esto con tus datos de Supabase (Project Settings > API)
const SUPABASE_URL = "https://tu-proyecto.supabase.co";
const SUPABASE_KEY = "tu-anon-key-de-supabase";

// Inicializar cliente Supabase de manera segura
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// LORICA DE PESTAÑAS MEJORADA (Arregla el bug del clic)
function cambiarPestana(evento, idSeccion) {
    // 1. Ocultar todos los bloques de contenido
    const contenidos = document.getElementsByClassName("contenido-pestana");
    for (let i = 0; i < contenidos.length; i++) {
        contenidos[i].classList.remove("activo");
    }

    // 2. Apagar el estado visual activo en todas las pestañas
    const pestanas = document.getElementsByClassName("pestana");
    for (let i = 0; i < pestanas.length; i++) {
        pestanas[i].classList.remove("activa");
    }

    // 3. Mostrar la sección que el usuario solicitó
    const seccionObjetivo = document.getElementById(idSeccion);
    if (seccionObjetivo) {
        seccionObjetivo.classList.add("activo");
    }
    
    // SOLUCIÓN AL BUG: Forzamos a buscar siempre el botón contenedor, ignorando el span interno
    const botonActivo = evento.target.closest('.pestana');
    if (botonActivo) {
        botonActivo.classList.add("activa");
    }
}

// Perfiles lógicos del resultado final
const perfilesCarreras = {
    'A': {
        titulo: "Tu perfil ideal: Ciencias de la Salud y Medicina",
        descripcion: "Tenés una fuerte vocación orientada al bienestar humano, el cuidado de la vida y las ciencias biológicas. Te destaca la empatía, la templanza bajo situaciones complejas y el deseo de investigar o intervenir activamente en la salud de las personas."
    },
    'B': {
        titulo: "Tu perfil ideal: Ciencias de Datos e Inteligencia Artificial",
        descripcion: "Sos una persona puramente analítica. Te apasiona la intersección entre la matemática avanzada, la lógica y la computación. Disfrutás encontrar patrones ocultos en grandes volúmenes de datos y entrenar algoritmos inteligentes para automatizar el futuro."
    },
    'C': {
        titulo: "Tu perfil ideal: Arte, Diseño y Humanidades",
        descripcion: "Tu mente se mueve a través de la creatividad, la comunicación y la interpretación de la cultura. Te inclinas por la expresión visual, literaria o audiovisual, o bien por el análisis crítico de la filosofía, la historia y la sociedad humana."
    },
    'D': {
        titulo: "Tu perfil ideal: Negocios, Leyes y Ciencias Sociales",
        descripcion: "Se te da muy bien la visión estratégica, la gestión organizacional y las estructuras normativas. Tenés aptitud para liderar equipos, entender la macroeconomía, defender derechos y resolver conflictos en el marco empresarial, legal o institucional."
    }
};

// Validación del cuestionario
const form = document.getElementById('quiz-form');
const textoFinal = document.getElementById('texto-final');
const tituloResultado = document.getElementById('resultado-titulo');
const descripcionResultado = document.getElementById('resultado-descripcion');
const statusSupabase = document.getElementById('status-supabase');
const totalPreguntas = 11; 

if (form) {
    form.addEventListener('change', async () => {
        const seleccionadas = form.querySelectorAll('input[type="radio"]:checked');

        if (seleccionadas.length === totalPreguntas) {
            
            let votos = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
            let payload = {};

            seleccionadas.forEach(input => {
                votos[input.value]++;
                payload[input.name] = input.value;
            });

            let letraGanadora = 'A';
            let maxVotos = 0;
            for (const letra in votos) {
                if (votos[letra] > maxVotos) {
                    maxVotos = votos[letra];
                    letraGanadora = letra;
                }
            }

            const resultadoFinal = perfilesCarreras[letraGanadora];
            tituloResultado.textContent = resultadoFinal.titulo;
            descripcionResultado.textContent = resultadoFinal.descripcion;
            
            textoFinal.style.display = 'block';
            textoFinal.scrollIntoView({ behavior: 'smooth' });

            payload['perfil_resultado'] = resultadoFinal.titulo;

            // Envío asíncrono a Supabase
            if (supabase) {
                statusSupabase.textContent = "Guardando respuestas en la base de datos...";
                const { error } = await supabase.from('respuestas_vocacionales').insert([payload]);
                
                if (error) {
                    statusSupabase.textContent = "Error al sincronizar con Supabase: " + error.message;
                    statusSupabase.style.color = "#ff0077";
                } else {
                    statusSupabase.textContent = "✓ Respuestas sincronizadas con Supabase exitosamente.";
                    statusSupabase.style.color = "#00ff88";
                }
            } else {
                statusSupabase.textContent = "Supabase no inicializado. Verificá tus llaves en script.js";
            }

        } else {
            textoFinal.style.display = 'none';
        }
    });
}