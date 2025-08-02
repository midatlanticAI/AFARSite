import hashlib
import logging
import os
from pathlib import Path

#from app.routes.audio_utils import generate_audio
#from app.services.polly_service import polly_service
#from app.utils.logging_config import setup_logger

# Define the static directory path
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static')

# Set up logging 
#logger = setup_logger('text utils')

# Update audio file paths
AUDIO_DIR = Path(static_dir) / 'audio'

# Add this mapping at the top of the file
VOICE_ENGINE_MAP = {
    "Joanna": "neural",
    "Lupe": "neural",
    "Zhiyu": "neural",
    "Seoyeon": "neural",
    "Lea": "neural",
    "Tatyana": "standard",  # Russian voice - standard engine
    "Aditi": "standard",    # Hindi voice - standard engine
    "Zeina": "standard"     # Arabic voice - standard engine
}

def get_voice_for_language(language: str) -> str:
    """Get the appropriate voice ID for a given language."""
    voice_map = {
        "english": "Joanna",
        "spanish": "Lupe",
        "mandarin": "Zhiyu",
        "russian": "Tatyana",
        "korean": "Seoyeon",
        "french": "Lea",
        "hindi": "Aditi",
        "arabic": "Zeina"
    }
    return voice_map.get(language.lower(), "Joanna")  # Default to Joanna if language not found

def load_prompt(language):
    """
    Load a prompt from a file based on the given language.
    
    Args:
        language (str): The language of the prompt to load.
    
    Returns:
        str: The content of the prompt file or a default message if the file is not found.
    """
    prompt_file = os.path.join('app', 'Prompts', language)
    try:
        with open(prompt_file, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except FileNotFoundError:
        #logger.warning(f"Prompt file not found for language: {language}. Using default prompt.")
        return "You are an AI assistant for All Fixed Appliance Repairs."

def get_prompt_text(prompt, language):
    """
    Get the prompt text for a specific prompt and language.
    
    Args:
        prompt (str): The name of the prompt.
        language (str): The language of the prompt.
    
    Returns:
        str: The prompt text or an error message if not found.
    """
    #logger.info(f"Getting prompt text for prompt: {prompt}, language: {language}")
    
    prompts = {
        "intro": {
            "english": "Hello, thank you for choosing All Fixed Appliance Repairs. For English, press 1.",
            "spanish": "Hola, gracias por elegir All Fixed Appliance Repairs. Para español, presione 2.",
            "french": "Bonjour, merci d'avoir choisi All Fixed Appliance Repairs. Pour le français, appuyez sur 3.",
            "arabic": "مرحبًا، شكرًا لاختيارك All Fixed Appliance Repairs. للعربية، اضغط على 4.",
            "russian": "Здравствуйте, спасибо, что выбрали All Fixed Appliance Repairs. Для русского языка нажмите 5.",
            "mandarin": "您好，感谢您选择All Fixed Appliance Repairs。普通话请按6。",
            "hindi": "नमस्ते, All Fixed Appliance Repairs चुनने के लिए धन्यवाद। हिंदी के लिए 7 दबाएँ।",
            "korean": "안녕하세요, All Fixed Appliance Repairs 를 선택해 주셔서 감사합니다. 한국어는 8번을 누르세요."
        },

        "main_menu": {
            "english": "Thank you for calling All Fixed Appliance Repairs. For quicker service and more information, please visit our website at w w w dot all fixed appliance dot com. To receive a text message with a link to provide your information, press 1. To leave a voice message, press 2. To speak with our A I assistant, press 3. To repeat these options, press 4.",
            "spanish": "Gracias por llamar a All Fixed Appliance Repairs. Para un servicio e información más rápidos, visite nuestro sitio web en tres w punto all fixed appliance punto com. Para recibir un mensaje de texto con un enlace para proporcionar su información, presione 1. Para dejar un mensaje de voz, presione 2. Para hablar con nuestro asistente de A I, presione 3. Para repetir estas opciones, presione 4.",
            "french": "Merci d'avoir appelé All Fixed Appliance Repairs. Pour un service et des informations plus rapides, veuillez visiter notre site web à trois w point all fixed appliance point com. Pour recevoir un message texte avec un lien pour fournir vos informations, appuyez sur 1. Pour laisser un message vocal, appuyez sur 2. Pour parler à notre assistant A I, appuyez sur 3. Pour répéter ces options, appuyez sur 4.",
            "arabic": "شكرا لاتصالك بـ All Fixed Appliance Repairs. للحصول على خدمة ومعلومات أسرع، يرجى زيارة موقعنا على w w w dot all fixed appliance dot com. لتلقي رسالة نصية تحتوي على رابط لتحديد موعدك، اضغط 1. لترك رسالة صوتية، اضغط 2. للتحدث مع مساعدنا الذكي A I، اضغط 3. لتكرار هذه الخيارات، اضغط 4.",
            "russian": "Спасибо за звонок в All Fixed Appliance Repairs. Для более быстрого обслуживания и получения информации посетите наш веб-сайт w w w dot all fixed appliance dot com. Чтобы получить текстовое сообщение со ссылкой для предоставления вашей информации, нажмите 1. Чтобы оставить голосовое сообщение, нажмите 2. Чтобы поговорить с нашим ассистентом A I, нажмите 3. Чтобы повторить эти варианты, нажмите 4.",
            "mandarin": "感谢您致电All Fixed Appliance Repairs。为了更快的服务和信息，请访问我们的官网，三 w 点 all fixed appliance 点 com。要接收带有链接以提供您信息的短信，请按1。要留下语音信息，请按2。要与我们的A I助手交谈，请按3。要重复这些选项，请按4。",
            "hindi": "All Fixed Appliance Repairs को कॉल करने के लिए धन्यवाद। अधिक तेज़ सेवा और जानकारी के लिए कृपया हमारी वेबसाइट w w w dot all fixed appliance dot com पर जाएँ। अपनी जानकारी प्रदान करने के लिए लिंक के साथ एक टेक्स्ट संदेश प्राप्त करने के लिए 1 दबाएँ। वॉइस मैसेज छोड़ने के लिए 2 दबाएँ। हमारे A I सहायक से बात करने के लिए 3 दबाएँ। इन विकल्पों को दोबारा सुनने के लिए 4 दबाएँ।",
            "korean": "All Fixed Appliance Repairs에 전화 주셔서 감사합니다. 빠른 서비스 및 정보를 원하시면 w w w dot all fixed appliance dot com을 방문해 주세요. 정보 제공 링크가 포함된 문자 메시지를 받으려면 1번을 누르세요. 음성 메시지를 남기려면 2번을 누르세요. AI 비서와 대화하려면 3번을 누르세요. 이 옵션을 다시 듣고 싶다면 4번을 누르세요."
        },
        "enter_phone": {
            "english": "Please enter your 10-digit phone number to receive a text message with a link to schedule your appointment.",
            "spanish": "Por favor, ingrese su número de teléfono de 10 dígitos para recibir un mensaje de texto con un enlace para programar su cita.",
            "french": "Veuillez entrer votre numéro de téléphone à 10 chiffres pour recevoir un message texte avec un lien pour planifier votre rendez-vous.",
            "arabic": "يرجى إدخال رقم هاتفك المكون من 10 أرقام لتلقي رسالة نصية تحتوي على رابط لتحديد موعدك.",
            "russian": "Пожалуйста, введите ваш 10-значный номер телефона, чтобы получить текстовое сообщение со ссылкой для назначения вашего приема.",
            "mandarin": "请输入您的10位电话号码，以接收包含预约链接的短信。",
            "hindi": "कृपया अपनी नियुक्ति निर्धारित करने के लिए लिंक के साथ एक टेक्स्ट संदेश प्राप्त करने के लिए अपना 10 अंकों का फोन नंबर दर्ज करें।",
            "korean": "예약 링크가 포함된 문자 메시지를 받으려면 10자리 전화번호를 입력해 주세요."
        },
        "sms_sent": {
            "english": "Thank you. We've sent a text message with a link to provide your information. Please check your phone and follow the link.",
            "spanish": "Gracias. Hemos enviado un mensaje de texto con un enlace para proporcionar su información. Por favor, revise su teléfono y siga el enlace.",
            "french": "Merci. Nous avons envoyé un message texte avec un lien pour fournir vos informations. Veuillez vérifier votre téléphone et suivre le lien.",
            "arabic": "شكرا لك. لقد أرسلنا رسالة نصية تحتوي على رابط لتقديم معلوماتك. يرجى التحقق من هاتفك واتباع الرابط.",
            "russian": "Спасибо. Мы отправили текстовое сообщение со ссылкой для предоставления вашей информации. Пожалуйста, проверьте свой телефон и перейдите по ссылке.",
            "mandarin": "谢谢。我们已发送一条包含提供信息链接的短信。请查看您的手机并点击链接。",
            "hindi": "धन्यवाद। हमने आपकी जानकारी प्रदान करने के लिए लिंक के साथ एक टेक्स्ट संदेश भेजा है। कृपया अपना फ़ोन चेक करें और लिंक का अनुसरण करें।",
            "korean": "감사합니다. 정보 제공 링크가 포함된 문자 메시지를 보냈습니다. 휴대폰을 확인하고 링크를 따라가 주세요."
        },
        "sms_error": {
            "english": "We're sorry, but we couldn't send the text message at this time. Please try again later or leave a voice message.",
            "spanish": "Lo sentimos, pero no pudimos enviar el mensaje de texto en este momento. Por favor, intente nuevamente más tarde o deje un mensaje de voz.",
            "french": "Nous sommes désolés, mais nous n'avons pas pu envoyer le message texte pour le moment. Veuillez réessayer plus tard ou laisser un message vocal.",
            "arabic": "نأسف، ولكن لم نتمكن من إرسال الرسالة النصية في هذا الوقت. يرجى المحاولة مرة أخرى لاحقًا أو ترك رسالة صوتية.",
            "russian": "Извините, но мы не смогли отправить текстовое сообщение в данный момент. Пожалуйста, попробуйте еще раз.",
            "mandarin": "抱歉，我们目前无法发送短信。请稍后重试或留言。",
            "hindi": "हमें खेद है, लेकिन हम इस समय टेक्स्ट संदेश नहीं भेज सके। कृपया बाद में पुनः प्रयास करें या वॉइस मैसेज छोड़ें।",
            "korean": "죄송합니다, 지금은 문자 메시지를 보낼 수 없습니다. 나중에 다시 시도하거나 음성 메시지를 남겨 주세요."
        },
        "invalid_phone": {
            "english": "Invalid phone number. Let's try again.",
            "spanish": "Número de teléfono inválido. Intentemos de nuevo.",
            "french": "Numéro de téléphone invalide. Essayons à nouveau.",
            "arabic": "رقم هاتف غير صالح. دعونا نحاول مرة أخرى.",
            "russian": "Неверный номер телефона. Давайте попробуем еще раз.",
            "mandarin": "无效的电话号码。让我们再试一次。",
            "hindi": "अमान्य फोन नंबर। चलिए फिर से प्रयास करें।",
            "korean": "잘못된 전화번호입니다. 다시 시도해 주세요."
        },
        "leave_message": {
            "english": "Please leave a detailed message after the tone. Include: your name, best contact phone number, complete address including zip code, the appliance type needing service, brand name and model number if available, and a clear description of the problem you're experiencing. Also mention any preferred appointment times. Please press the pound key when you're finished.",
            "spanish": "Por favor, deje un mensaje detallado después del tono. Incluya: su nombre, el mejor número de teléfono para contactarlo, dirección completa con código postal, el tipo de electrodoméstico que necesita servicio, marca y número de modelo si está disponible, y una descripción clara del problema que está experimentando. También mencione sus horarios preferidos para la cita. Por favor, presione la tecla numeral cuando haya terminado.",
            "french": "Veuillez laisser un message détaillé après le signal sonore. Incluez: votre nom, votre meilleur numéro de téléphone, votre adresse complète avec code postal, le type d'appareil nécessitant une réparation, la marque et le numéro de modèle si disponible, et une description claire du problème que vous rencontrez. Mentionnez également vos créneaux horaires préférés pour le rendez-vous. Appuyez sur la touche dièse lorsque vous avez terminé.",
            "arabic": "يرجى ترك رسالة مفصلة بعد النغمة. يجب أن تتضمن: اسمك، وأفضل رقم هاتف للاتصال بك، والعنوان الكامل متضمناً الرمز البريدي، ونوع الجهاز الذي يحتاج إلى صيانة، واسم العلامة التجارية ورقم الموديل إن وجد، ووصف واضح للمشكلة التي تواجهها. يرجى أيضاً ذكر الأوقات المفضلة للموعد. اضغط على مفتاح الشباك عند الانتهاء.",
            "russian": "Пожалуйста, оставьте подробное сообщение после сигнала. Укажите: ваше имя, удобный номер телефона для связи, полный адрес с почтовым индексом, тип бытовой техники, требующей обслуживания, марку и номер модели, если известны, и четкое описание проблемы, с которой вы столкнулись. Также укажите предпочтительное время для визита мастера. Нажмите клавишу решётки, когда закончите.",
            "mandarin": "请在提示音后留下详细信息。请包括：您的姓名、最佳联系电话、完整地址（包括邮政编码）、需要维修的电器类型、品牌和型号（如果知道的话），以及您遇到的问题的清晰描述。另外请说明您希望预约的时间。完成后请按井号键。",
            "hindi": "कृपया टोन के बाद एक विस्तृत संदेश छोड़ें। इसमें शामिल करें: आपका नाम, सर्वोत्तम संपर्क फोन नंबर, पिन कोड सहित पूरा पता, सेवा की आवश्यकता वाले उपकरण का प्रकार, ब्रांड नाम और मॉडल नंबर यदि उपलब्ध हो, और आप जो समस्या का सामना कर रहे हैं उसका स्पष्ट विवरण। कृपया पसंदीदा अपॉइंटमेंट समय भी बताएं। जब आप समाप्त कर लें तो पाउंड की दबाएं।",
            "korean": "신호음이 들린 후 자세한 메시지를 남겨 주세요. 다음 사항을 포함해 주세요: 성함, 연락 가능한 전화번호, 우편번호를 포함한 전체 주소, 서비스가 필요한 가전제품 종류, 가능한 경우 브랜드명과 모델번호, 그리고 겪고 계신 문제에 대한 명확한 설명. 선호하시는 방문 시간대도 말씀해 주세요. 메시지를 마치시면 우물 정(#) 버튼을 눌러 주세요."
        },
        "check_phone_number": {
            "english": "To confirm this is the correct number to receive your booking link, press 1. To re-enter your number, press any other key.",
            "spanish": "Para confirmar que este es el número correcto para recibir su enlace de reserva, presione 1. Para volver a ingresar su número, presione cualquier otra tecla.",
            "french": "Pour confirmer que c'est le bon numéro pour recevoir votre lien de réservation, appuyez sur 1. Pour saisir à nouveau votre numéro, appuyez sur n'importe quelle autre touche.",
            "arabic": "لتأكيد أن هذا هو الرقم الصحيح لتلقي رابط الحجز الخاص بك، اضغط على 1. لإعادة إدخال رقمك، اضغط على أي مفتاح آخر.",
            "russian": "Чтобы подтвердить, что это правильный номер для получения ссылки для бронирования, нажмите 1. Чтобы ввести номер повторно, нажмите любую другую клавишу.",
            "mandarin": "要确认这是接收预订链接的正确号码，请按1。要重新输入您的号码，请按任意其他键。",
            "hindi": "इस बात की पुष्टि करने के लिए कि यह आपकी बुकिंग लिंक प्राप्त करने के लिए सही नंबर है, 1 दबाएँ। अपना नंबर फिर से दर्ज करने के लिए, किसी अन्य कुंजी को दबाएँ।",
            "korean": "예약 링크를 받을 올바른 번호인지 확인하려면 1을 누르세요. 번호를 다시 입력하려면 다른 키를 누르세요."
        },
        "wrong_phone_number": {
            "english": "Let's try entering your phone number again. Please listen carefully and enter all 10 digits of your phone number.",
            "spanish": "Intentemos ingresar su número de teléfono nuevamente. Por favor, escuche atentamente e ingrese los 10 dígitos de su número de teléfono.",
            "french": "Essayons de saisir à nouveau votre numéro de téléphone. Veuillez écouter attentivement et entrer les 10 chiffres de votre numéro de téléphone.",
            "arabic": "دعنا نحاول إدخال رقم هاتفك مرة أخرى. يرجى الاستماع بعناية وإدخال جميع الأرقام العشرة لرقم هاتفك.",
            "russian": "Давайте попробуем ввести ваш номер телефона еще раз. Пожалуйста, внимательно слушайте и введите все 10 цифр вашего номера телефона.",
            "mandarin": "让我们再次尝试输入您的电话号码。请仔细听并输入您电话号码的全部10位数字。",
            "hindi": "आइए आपका फ़ोन नंबर फिर से दर्ज करने का प्रयास करें। कृपया ध्यान से सुनें और अपने फ़ोन नंबर के सभी 10 अंक दर्ज करें।",
            "korean": "전화번호를 다시 입력해 봅시다. 주의 깊게 듣고 전화번호 10자리를 모두 입력하세요."
        },
        "message_received": {
            "english": "Thank you for your message. A representative will get back to you soon.",
            "spanish": "Gracias por su mensaje. Un representante se pondrá en contacto con usted pronto.",
            "french": "Merci pour votre message. Un représentant vous contactera bientôt.",
            "arabic": "شكرا لرسالتك. سيتصل بك ممثل في أقرب وقت.",
            "russian": "Спасибо за ваше сообщение. Представитель скоро свяжется с вами.",
            "mandarin": "感谢您的留言。代表人员将很快与您联系。",
            "hindi": "आपके संदेश के लिए धन्यवाद। एक प्रतिनिधि आपसे शीघ्र ही संपर्क करेगा।",
            "korean": "메시지를 남겨 주셔서 감사합니다. 담당자가 곧 연락드리겠습니다."
        },
        "recording_failed": {
            "english": "We couldn't record your message. Please try again.",
            "spanish": "No pudimos grabar su mensaje. Por favor, inténtelo de nuevo.",
            "french": "Nous n'avons pas pu enregistrer votre message. Veuillez réessayer.",
            "arabic": "لم نتمكن من تسجيل رسالتك. يرجى المحاولة مرة أخرى.",
            "russian": "Мы не смогли записать ваше сообщение. Пожалуйста, попробуйте еще раз.",
            "mandarin": "我们无法录制您的留言。请再试一次。",
            "hindi": "हम आपका संदेश रिकॉर्ड नहीं कर सके। कृपया पुनः प्रयास करें।",
            "korean": "메시지를 녹음할 수 없었습니다. 다시 시도해 주세요."
        },
        "goodbye": {
            "english": "Thank you for contacting All Fixed Appliance Repairs. Have a great day!",
            "spanish": "Gracias por contactar a All Fixed Appliance Repairs. ¡Que tenga un excelente día!",
            "french": "Merci d'avoir contacté All Fixed Appliance Repairs. Passez une excellente journée !",
            "arabic": "شكرا لك على الاتصال بـ All Fixed Appliance Repairs. أتمنى لك يوما رائعا!",
            "russian": "Спасибо за обращение в All Fixed Appliance Repairs. Хорошего дня!",
            "mandarin": "感谢您联系All Fixed Appliance Repairs。祝您有一个美好的一天！",
            "hindi": "All Fixed Appliance Repairs से संपर्क करने के लिए धन्यवाद। आपका दिन शुभ हो!",
            "korean": "All Fixed Appliance Repairs에 연락해 주셔서 감사합니다. 좋은 하루 보내세요!"
        },
        "invalid_input": {
            "english": "I'm sorry, I didn't understand that. Let's try again.",
            "spanish": "Lo siento, no entendí eso. Intentemos de nuevo.",
            "french": "Je suis désolé, je n'ai pas compris. Essayons à nouveau.",
            "arabic": "آسف، لم أفهم ذلك. دعونا نحاول مرة أخرى.",
            "russian": "Извините, я не понял. Давайте попробуем еще раз.",
            "mandarin": "抱歉，我没有听懂。让我们再试一次。",
            "hindi": "मुझे खेद है, मैं वह समझ नहीं पाया। चलिए फिर से प्रयास करें।",
            "korean": "죄송합니다. 이해하지 못했습니다. 다시 시도해 주세요."
        },
        "ai_greeting": {
            "english": "You are now being connected to Max, our customer service assistant. Max will gather your contact details and information about your appliance issue to set up your service appointment. Please speak clearly when providing your name, phone number, and address.",
            "spanish": "Ahora está hablando con nuestro asistente de servicio al cliente, Max. Max recopilará sus datos de contacto e información sobre su problema con el electrodoméstico para programar su cita de servicio. Por favor, hable claramente al proporcionar su nombre, número de teléfono y dirección.",
            "french": "Vous êtes maintenant en communication avec Max, notre assistant de service à la clientèle. Max recueillera vos coordonnées et des informations sur votre problème d'appareil pour organiser votre rendez-vous de service. Veuillez parler clairement lorsque vous fournissez votre nom, numéro de téléphone et adresse.",
            "arabic": "أنت الآن متصل بماكس، مساعد خدمة العملاء لدينا. سيقوم ماكس بجمع معلومات الاتصال الخاصة بك ومعلومات حول مشكلة جهازك لإعداد موعد الخدمة الخاص بك. يرجى التحدث بوضوح عند تقديم اسمك ورقم هاتفك وعنوانك.",
            "russian": "Вас соединяют с Максом, нашим ассистентом по обслуживанию клиентов. Макс соберет ваши контактные данные и информацию о проблеме с вашим прибором для организации визита мастера. Пожалуйста, говорите чётко, когда сообщаете своё имя, номер телефона и адрес.",
            "mandarin": "您现在已连接到我们的客户服务助手Max。Max将收集您的联系方式和设备问题的信息，以安排您的服务预约。请在提供姓名、电话号码和地址时清晰地讲话。",
            "hindi": "आप अब हमारे ग्राहक सेवा सहायक मैक्स से जुड़ रहे हैं। मैक्स आपकी संपर्क जानकारी और आपके उपकरण की समस्या के बारे में जानकारी एकत्र करेगा ताकि आपकी सेवा अपॉइंटमेंट सेट करने में मदद करे। कृपया अपना नाम, फोन नंबर और पता देते समय स्पष्ट रूप से बोलें।",
            "korean": "이제 당사의 고객 서비스 어시스턴트인 Max와 연결되었습니다. Max가 귀하의 연락처 정보와 가전제품 문제에 대한 정보를 수집하여 서비스 예약을 도와드릴 것입니다. 이름, 전화번호 및 주소를 제공할 때 명확하게 말씀해 주세요."
        },
        "booking_prompt": {
            "english": "I'll now collect your contact information to schedule a service appointment. This will help our technician address your appliance issue efficiently.",
            "spanish": "Ahora recopilaré su información de contacto para programar una cita de servicio. Esto ayudará a nuestro técnico a resolver el problema de su electrodoméstico de manera eficiente.",
            "french": "Je vais maintenant recueillir vos coordonnées pour planifier un rendez-vous de service. Cela aidera notre technicien à résoudre efficacement le problème de votre appareil.",
            "arabic": "سأقوم الآن بجمع معلومات الاتصال الخاصة بك لجدولة موعد الخدمة. سيساعد ذلك الفني لدينا في معالجة مشكلة جهازك بكفاءة.",
            "russian": "Сейчас я соберу вашу контактную информацию для планирования визита мастера. Это поможет нашему технику эффективно решить проблему с вашим прибором.",
            "mandarin": "我现在将收集您的联系信息以安排服务预约。这将帮助我们的技术人员有效解决您的设备问题。",
            "hindi": "मैं अब सर्विस अपॉइंटमेंट शेड्यूल करने के लिए आपकी संपर्क जानकारी एकत्र करूंगा। यह हमारे तकनीशियन को आपके उपकरण की समस्या को कुशलतापूर्वक हल करने में मदद करेगा।",
            "korean": "이제 서비스 예약을 위해 연락처 정보를 수집하겠습니다. 이는 기술자가 가전제품 문제를 효율적으로 해결하는 데 도움이 됩니다."
        },
        "continue_conversation": {
            "english": "Alright, let's continue our conversation. What else can I help you with?",
            "spanish": "De acuerdo, continuemos nuestra conversación. ¿En qué más puedo ayudarle?",
            "french": "D'accord, continuons notre conversation. En quoi puis-je vous aider d'autre ?",
            "arabic": "حسنًا، دعونا نستمر في محادثتنا. ما الذي يمكنني مساعدتك به الآن؟",
            "russian": "Хорошо, давайте продолжим наш разговор. Чем еще я могу вам помочь?",
            "mandarin": "好的，让我们继续对话。我还能帮您什么？",
            "hindi": "ठीक है, चलिए हमारी बातचीत जारी रखते हैं। मैं और किस प्रकार से आपकी मदद कर सकता हूँ?",
            "korean": "좋아요, 대화를 계속하죠. 다른 무엇을 도와드릴까요?"
        },
        "farewell": {
            "english": "Thank you for using our AI assistant. Is there anything else I can help you with? Say yes to continue or no to end the call.",
            "spanish": "Gracias por usar nuestro asistente de IA. ¿Hay algo más en lo que pueda ayudarle? Diga sí para continuar o no para finalizar la llamada.",
            "french": "Merci d'avoir utilisé notre assistant IA. Y a-t-il autre chose dont je puisse vous aider ? Dites oui pour continuer ou non pour mettre fin à l'appel.",
            "arabic": "شكرا لاستخدامك مساعدنا الذكي. هل هناك شيء آخر يمكنني مساعدتك به؟ قل نعم للمتابعة أو لا لإنهاء المكالمة.",
            "russian": "Спасибо за использование нашего ИИ-ассистента. Есть ли еще что-нибудь, чем я могу вам помочь? Скажите да, чтобы продолжить, или нет, чтобы завершить звонок.",
            "mandarin": "感谢您使用我们的AI助手。我还能帮您什么吗？说是继续，否则结束通话。",
            "hindi": "हमारे AI सहायक का उपयोग करने के लिए धन्यवाद। क्या कोई और बात है जिसमे मैं आपकी मदद कर सकता हूँ? हाँ कहें जारी रखने के लिए या नहीं कहें कॉल समाप्त करने के लिए।",
            "korean": "AI 비서를 사용해 주셔서 감사합니다. 다른 도와드릴 것이 있나요? 계속하려면 '예', 통화를 끝내려면 '아니요'라고 말해 주세요."
        },
        "error_message": {
            "english": "I'm sorry, I'm having trouble processing your request. Could you please try again?",
            "spanish": "Lo siento, estoy teniendo problemas para procesar su solicitud. ¿Podría intentarlo de nuevo?",
            "french": "Je suis désolé, j'ai des difficultés à traiter votre demande. Pourriez-vous réessayer ?",
            "arabic": "آسف، أنا أواجه صعوبات في معالجة طلبك. هل يمكنك الحاولة مرة أخرى؟",
            "russian": "Извините, у меня возникли проблемы с обработкой вашего запроса. Не могли бы вы попробовать еще раз?",
            "mandarin": "抱歉，我在处理您的请求时遇到了困难。您能再试一次吗？",
            "hindi": "मुझे खेद है, आपकी अनुरोध को संसाधित करने में मुझे समस्या हो रही है। क्या आप कृपया फिर से प्रयास कर सकते हैं?",
            "korean": "요청을 처리하는 중에 문제가 발생했습니다. 다시 시도해 주시겠어요?"
        },
        "sms_link": {
            "english": "Thank you for contacting All Fixed Appliance Repair, LLC. We want to let you know that there is a $90 service charge for the initial visit, which includes diagnosis and a repair estimate. If you choose to proceed with the repairs, this fee will be applied toward the total cost. To schedule your appointment, please complete the service request form at the provided link: https://app.kickserv.com/allfixedappliance/self_service/requests/new",
            "spanish": "Gracias por contactar a All Fixed Appliance Repair, LLC. Queremos informarle que hay un cargo de $90 por la visita inicial, que incluye diagnóstico y una estimación de reparación. Si decide proceder con las reparaciones, esta tarifa se aplicará al costo total. Para programar su cita, por favor complete el formulario de solicitud de servicio en el enlace proporcionado: https://app.kickserv.com/allfixedappliance/self_service/requests/new",
            "french": "Merci d'avoir contacté All Fixed Appliance Repair, LLC. Nous souhaitons vous informer qu'il y a des frais de 90 $ pour la visite initiale, qui comprend le diagnostic et une estimation de réparation. Si vous choisissez de procéder aux réparations, ces frais seront déduits du coût total. Pour planifier votre rendez-vous, veuillez remplir le formulaire de demande de service au lien fourni : https://app.kickserv.com/allfixedappliance/self_service/requests/new",
            "arabic": "شكرًا لاتصالك بـ All Fixed Appliance Repair, LLC. نود إعلامك بوجود رسوم خدمة قدرها 90 دولارًا للزيارة الأولى، والتي تشمل التشخيص وتقدير الإصلاح. إذا اخترت المضي قدمًا في الإصلاحات، سيتم تطبيق هذه الرسوم على التكلفة الإجمالية. لحجز موعدك، يرجى إكمال نموذج طلب الخدمة على الرابط المقدم: https://app.kickserv.com/allfixedappliance/self_service/requests/new",
            "russian": "Спасибо за обращение в All Fixed Appliance Repair, LLC. Мы хотим сообщить вам, что взимается плата в размере 90 долларов за первый визит, который включает диагностику и оценку ремонта. Если вы решите продолжить ремонт, эта сумма будет вычтена из общей стоимости. Чтобы назначить встречу, пожалуйста, заполните форму заявки на обслуживание по предоставленной ссылке: https://app.kickserv.com/allfixedappliance/self_service/requests/new",
            "mandarin": "感谢您联系 All Fixed Appliance Repair, LLC。我们想通知您，首次上门服务费用为 90 美元，包括诊断和维修估价。如果您选择继续维修，此费用将从总费用中扣除。要安排您的预约，请在提供的链接完成服务请求表格：https://app.kickserv.com/allfixedappliance/self_service/requests/new",
            "hindi": "All Fixed Appliance Repair, LLC से संपर्क करने के लिए धन्यवाद। हम आपको सूचित करना चाहते हैं कि प्रारंभिक यात्रा, निदान और मरम्मत अनुमान के लिए $90 की सेवा शुल्क है। यदि आप मरम्मत जारी रखने का निर्णय लेते हैं, तो यह शुल्क कुल लागत में समायोजित किया जाएगा। अपनी नियुक्ति निर्धारित करने के लिए, कृपया प्रदान किए गए लिंक पर सेवा अनुरोध फ़ॉर्म पूरा करें: https://app.kickserv.com/allfixedappliance/self_service/requests/new",
            "korean": "All Fixed Appliance Repair, LLC에 연락해 주셔서 감사합니다. 초기 방문에는 진단 및 수리 견적을 포함하여 $90의 서비스 요금이 있음을 알려드립니다. 수리를 진행하시면 이 비용은 총 비용에 적용됩니다. 예약을 위해 제공된 링크에서 서비스 요청 양식을 작성해 주세요: https://app.kickserv.com/allfixedappliance/self_service/requests/new"
        },
        "missed_call_sms": {
            "english": "We noticed you recently tried to reach All Fixed Appliance Repair, but we missed your call. We're sorry we couldn't connect with you! Your appliance issue is important to us and we'd like to help. For faster service, please text us at 5404414349 with any questions, issues or concerns or click this link to schedule a service appointment: https://app.kickserv.com/allfixedappliance/self_service/requests/new. Same-day or next-day appointments may be available. Our certified technicians specialize in fast, reliable repairs with a 90-day warranty on all parts and labor.",
            "spanish": "Notamos que recientemente intentó comunicarse con All Fixed Appliance Repair, pero perdimos su llamada. ¡Lamentamos no haber podido conectarnos con usted! Su problema con el electrodoméstico es importante para nosotros y nos gustaría ayudar. Para un servicio más rápido, por favor envíenos un mensaje de texto al 5404414349 con cualquier pregunta, problema o inquietud, o haga clic en este enlace para programar una cita de servicio: https://app.kickserv.com/allfixedappliance/self_service/requests/new. Puede que haya citas disponibles para el mismo día o el siguiente. Nuestros técnicos certificados se especializan en reparaciones rápidas y confiables con una garantía de 90 días en todas las piezas y mano de obra."
        },
        "booking_message": {
            "english": "Based on the issue you've described, it would be best to have one of our expert repair technicians take a look. The next step will be to collect your cell-phone number when you are prompted and you will receive a text message with a link to schedule your appointment.",
            "spanish": "Según el problema que ha descrito, sería mejor que un técnico profesional lo examinara. Ahora le transferiré a nuestro sistema de reservas. Por favor, ingrese su número de teléfono de 10 dígitos cuando se le solicite, y recibirá un mensaje de SMS con un enlace para programar su cita.",
            "french": "D'après le problème que vous avez décrit, il serait préférable qu'un technicien professionnel y jette un coup d'œil. Je vais maintenant vous transférer à notre système de réservation. Veuillez entrer votre numéro de téléphone à 10 chiffres lorsque vous y êtes invité, et vous recevrez un message SMS avec un lien pour planifier votre rendez-vous.",
            "arabic": "بناءً على المشكلة التي وصفتها، سيكون من الأفضل أن يلقي فني متخصص نظرة عليها. سأقوم الآن بتحويلك إلى نظام الحجز لدينا. يرجى إدخال رقم هاتفك المكون من 10 أرقام عند المطالبة، وستتلقى رسالة نصية تحتوي على رابط لتحديد موعدك.",
            "russian": "Исходя из описанной вами проблемы, было бы лучше, если бы профессиональный техник осмотрел устройство. Сейчас я переведу вас в нашу систему бронирования. Пожалуйста, введите ваш 10-значный номер телефона по запросу, и вы получите текстовое сообщение со ссылкой для назначения вашего приема.",
            "mandarin": "根据您描述的问题，最好让专业技术人员来看看。我现在将为您转接到我们的预约系统。请在提示时输入您的10位手机号码，您将收到一条带有预约链接的短信。",
            "hindi": "आपके द्वारा वर्णित समस्या के आधार पर, एक पेशेवर तकनीशियन को इसे देखना सबसे अच्छा होगा अब मैं आपको हमारे बुकिंग सिस्टम में स्थानांतरित कर रहा हूँ। कृपया संकेत मिलने पर अपना 10 अंकों का फ़ोन नंबर दर्ज करें, और आपको अपॉइंटमेंट शेड्यूल करने के लिए लिंक के साथ एक टेक्स्ट संदेश प्राप्त होगा।",
            "korean": "설명하신 문제에 따라 전문 기술자가 확인하는 것이 좋습니다. 이제 예약 시스템으로 연결해 드리겠습니다. 안내에 따라 10자리 전화번호를 입력해 주시면, 예약 링크가 포함된 문자 메시지를 받게 됩니다."
        }
    }

    result = prompts.get(prompt, {}).get(language, prompts.get(prompt, {}).get("english", None))

    if result is None:
        #logger.warning(f"Missing prompt text for prompt: {prompt}, language: {language}")
        result = f"Text not available for this prompt '{prompt}' and language '{language}'."

    return result

async def ensure_audio_files():
    """Ensure all required audio files exist"""
    try:
        # Create directories if they don't exist
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        
        # List of required intro files for each language
        languages = ['english', 'spanish', 'mandarin', 'russian', 'korean', 'french', 'hindi', 'arabic']
        
        for lang in languages:
            intro_file = AUDIO_DIR / f'intro_{lang}.mp3'
            if not intro_file.exists():
               #logger.info(f"Generating intro audio for {lang}")
                text = get_prompt_text("intro", lang)
                voice_id = get_voice_for_language(lang)
                engine = VOICE_ENGINE_MAP.get(voice_id, "standard")  # Use standard engine as fallback
                
                #await generate_audio(text, str(intro_file), voice_id=voice_id, engine=engine)
                #logger.info(f"Generated {intro_file}")
                
        #logger.info("All audio files checked/generated successfully")
        
    except Exception as e:
        #logger.error(f"Error ensuring audio files: {str(e)}", exc_info=True)
        raise

def should_regenerate_file(file_path, content):
    """
    Check if a file needs to be regenerated based on its content hash.
    
    Args:
        file_path (str): Path to the audio file.
        content (str): Content used to generate the audio file.
    
    Returns:
        bool: True if the file should be regenerated, False otherwise.
    """
    content_hash = hashlib.md5(content.encode()).hexdigest()
    hash_file_path = f"{file_path}.hash"

    if os.path.exists(file_path) and os.path.exists(hash_file_path):
        with open(hash_file_path, 'r') as hash_file:
            existing_hash = hash_file.read().strip()
        return existing_hash != content_hash
    return True

def update_file_hash(file_path, content):
    """
    Update the hash file for a generated audio file.
    
    Args:
        file_path (str): Path to the audio file.
        content (str): Content used to generate the audio file.
    """
    content_hash = hashlib.md5(content.encode()).hexdigest()
    hash_file_path = f"{file_path}.hash"
    with open(hash_file_path, 'w') as hash_file:
        hash_file.write(content_hash)

def get_voice_id(language):
    """
    Get the appropriate voice ID for a given language.
    
    Args:
        language (str): The language for which to get the voice ID.
    
    Returns:
        str: The voice ID for the specified language.
    """
    voice_ids = {
        "english": "Joanna",
        "spanish": "Lupe",
        "french": "Lea",
        "arabic": "Zeina",
        "russian": "Tatyana",
        "mandarin": "Zhiyu",
        "hindi": "Aditi",
        "korean": "Seoyeon"
    }
    return voice_ids.get(language, "Joanna")  # Default to Joanna if language not found

def get_language_code(language):
    """
    Get the appropriate language code for a given language.
    
    Args:
        language (str): The language for which to get the code.
    
    Returns:
        str: The language code for the specified language.
    """
    language_codes = {
        "english": "en-US",
        "spanish": "es-US",
        "french": "fr-FR",
        "arabic": "arb",
        "russian": "ru-RU",
        "mandarin": "cmn-CN",
        "hindi": "hi-IN",
        "korean": "ko-KR"
    }
    return language_codes.get(language, "en-US")  # Default to en-US if language not found

def get_engine(language):
    """
    Determine the appropriate engine (neural or standard) for a given language.
    
    Args:
        language (str): The language for which to determine the engine.
    
    Returns:
        str: Either "neural" or "standard" depending on the language.
    """
    neural_languages = ["english", "spanish", "french", "mandarin", "korean"]
    return "neural" if language in neural_languages else "standard"