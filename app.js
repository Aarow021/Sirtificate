
window.addEventListener("DOMContentLoaded", () => {

    let recipientInput = ' ';
    let issuerInput = ' ';
    let titleInput = ' ';
    let dateInput = ' ';

    //Lets async functions halt for a given amount of time.
    //Usage: await sleep(ms);
    let sleep = ms => new Promise( resolve => setTimeout(resolve, ms));

    //Simulates a for-each loop on a dictionary with keys [0 - length-1]
    function pseudoForEach(dict, func) {
        for (let i = 0; i < dict.length; i++) {
            func(dict[i])
        }
    }

    //Certificate base class
    class Certificate {
        constructor(
            src='Images/certificate-placeholder.png',
            color='black',
            certificateTitle='OF THE PLACEHOLDER',
            lead='This informs',
            recipient='Recipient',
            message='That they should select a certificate from the top of the page.',
            issuer='Placeholder',
            issuerTitle='Title',
            logoSrc='Images/icon-placeholder.png',
            logoAlt='Placeholder logo',
            date='1987-14-11',
            colorScheme=[],
            lineColor = 'black',
            shadow = false,
            elementList=['certificate-heading', 'certificate-title', 'certificate-lead', 'recipient', 'message', 'issuer', 'title', 'date']
        ) {
            this.src = src;
            this.color = color;
            this.certificateTitle = certificateTitle;
            this.lead = lead;
            this.recipient = recipient;
            this.message = message;
            this.issuer = issuer;
            this.issuerTitle = issuerTitle;
            this.logoSrc = logoSrc;
            this.logoAlt = logoAlt;
            this.date = date;
            this.colorScheme = colorScheme;
            this.lineColor = lineColor;
            this.shadow = shadow;
            this.elementList = elementList;
        }

        //Removes special colors from colorable elements
        clearColors() {
            for (let i = 0; i < this.elementList.length; i++) {
                document.getElementById(this.elementList[i]).className = '';
            }
        }

        //Sets the text and line colors
        setColors() {
            for (let i = 0; i < this.colorScheme.length; i++) {
                if (!this.colorScheme[i]) continue;
                document.getElementById(this.elementList[i]).classList.add(this.colorScheme[i] + '-text');
            }
            for (let lineParent of ['recipient', 'issuer', 'date']) {
                document.getElementById(lineParent).classList.add(this.lineColor + '-line');
            }
            if (this.shadow) {
                for (let i = 0; i < this.elementList.length; i++) {
                    document.getElementById(this.elementList[i]).classList.add('text-shadow');
                }
            }
            
        }

        //Sets certificate data shown in document to this certificate's data (generates the certificate)
        generate() {
            document.getElementById('certificate').style.backgroundImage = `url(${this.src})`;
            document.getElementById('certificate-inner').style.color = this.color;
            document.getElementById('certificate-title').innerText = this.certificateTitle;
            document.getElementById('certificate-lead').innerText = this.lead;
            document.getElementById('recipient').innerText = this.recipient;
            document.getElementById('message').innerText = this.message;
            document.getElementById('issuer').innerText = this.issuer;
            document.getElementById('title').innerText = this.issuerTitle;
            document.getElementById('certificate-logo').src = this.logoSrc;
            document.getElementById('certificate-logo').alt = this.logoAlt;
            document.getElementById('date').innerText = this.date;
            this.clearColors();
            this.setColors();
        }
    }

    class Rick {
        constructor() {
            let gif = document.createElement('img');
            let container = document.createElement('div');
            this.gif = gif;
            this.container = container;
            gif.src = 'Images/rick-gif.gif';
            gif.alt = 'Rick Astley dancing';
            gif.classList.add('rick-gif');
            container.classList.add('rick-box');
            container.appendChild(gif);
        }

        spawn() {
            document.getElementById('rick-container').appendChild(this.container);
        }
    }

    //Generates certificate objects
    let placeholderCertificate = new Certificate();
    let noSleepCertificate = new Certificate(
        'Images/certificate-sleep-deprived.png',
        'white',
        'OF SLEEP DEPRIVATION',
        'This certifies that',
        ' ',
        'Gets a whole lot of sleep...only in their dreams.',
        ' ',
        ' ',
        'Images/icon-bed.png',
        'No Sleep Foundation logo',
        ' ',
        ['gold', 'gold', null, 'gold', null, 'gold', 'gold', 'gold'],
        'gold'
    );
    let rickCertificate = new Certificate(
        'Images/certificate-rick.png',
        'white',
        'OF THE RICK ROLLED',
        'This certifies that',
        ' ',
        'Got thoroughly rolled by Rick.',
        ' ',
        ' ',
        'Images/icon-rick.png',
        'Silhouette of Rick Astley',
        ' ',
        ['gold', 'gold', null, 'gold', null, 'gold', 'gold', 'gold'],
        'gold'
    );
    let brainRotCertificate = new Certificate(
        'Images/certificate-brainrot.png',
        'white',
        'OF BRAIN ROT',
        'This signifies that',
        ' ',
        'Is too far gone. Their mind has been taken over by an insidious, unrecoverable case of brain-rot 💀',
        ' ',
        ' ',
        'Images/icon-skibidi.png',
        'Skibidi medal icon',
        ' ',
        ['silver', 'silver', null, 'gold', null, 'gold', 'gold', 'gold'],
        'gold',
        true
    );

    //Either sets variables to the element's values or vice versa
    function updateText(type='write') {
        if (type === 'read') {
            recipientInput = document.getElementById('recipient').innerText;
            issuerInput = document.getElementById('issuer').innerText;
            titleInput = document.getElementById('title').innerText;
            dateInput = document.getElementById('date').innerText;
        } else if (type === 'write') {
            document.getElementById('recipient').innerText = recipientInput;
            document.getElementById('issuer').innerText = issuerInput;
            document.getElementById('title').innerText = titleInput;
            document.getElementById('date').innerText = dateInput;
        }
    }

    //Handles certificate button presses
    function buttonHandler(e) {
        let btn = e.target;

        //Toggles current button's state, removes active from other buttons
        if (btn.className.includes('active')) {
            btn.classList.remove('active');
        } else {
            let activeBtn = document.querySelector('nav .active');
            if (activeBtn) activeBtn.classList.remove('active');
            btn.classList.add('active');
        }

        //Generates certificate based on what button is pressed/active
        if (!btn.className.includes('active')) {
            placeholderCertificate.generate();
            updateText();
            return;
        }

        if (btn.id === 'sleep') {
            noSleepCertificate.generate();
        }
        else if (btn.id === 'roll') {
            rickCertificate.generate();
            createRick();
        }
        else if (btn.id === 'brain') {
            brainRotCertificate.generate();
        }

        updateText();
    }

    function inputHandler(e) {
        let textValue = e.target.value;
        let id = e.target.id;
        document.getElementById(id.substring(6)).innerText = textValue || ' ';
        updateText('read');
    }

    function createRick() {
        let newRick = new Rick();
        newRick.spawn();
    }

    //Generates the starting certificate
    placeholderCertificate.generate();
    
    //Sets certificate date to current date
    document.getElementById('date').innerText = new Date().toLocaleDateString().replaceAll('/', '-');
    updateText('read');

    //Adds button handler to certificate buttons
    let buttons = document.querySelectorAll('nav button');
    pseudoForEach(buttons, button => {
        button.addEventListener('click', buttonHandler);
    })

    //Adds print button functionality
    document.getElementById('print').addEventListener('click', e => {
        window.print();
    })

    //Adds input handler to text inputs
    let inputs = document.querySelectorAll('#certificate-customization input');
    pseudoForEach(inputs, input => {
        input.addEventListener('input', inputHandler)
    })
    
})
