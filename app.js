
window.addEventListener("DOMContentLoaded", () => {

    let recipientInput = ' ';
    let issuerInput = ' ';
    let titleInput = ' ';
    let dateInput = ' ';
    let ricks = [];
    let ricksCreated = 0;
    let score = 0;
    let scoreDisplay;
    let comboDisplay;
    let combo = 0;
    let numAirborn = 0;

    //Lets async functions halt for a given amount of time.
    //Usage: await sleep(ms);
    let sleep = ms => new Promise( resolve => setTimeout(resolve, ms));

    //Simulates a for-each loop on a dictionary with keys [0 - length-1]
    function pseudoForEach(dict, func) {
        for (let i = 0; i < dict.length; i++) {
            func(dict[i])
        }
    }

    //Returns the center of the viewport
    function getWindowCenter() {
        return [window.innerWidth/2, window.innerHeight/2];
    }

    //Returns the number or its outer-bound if the number is outside the bounds
    function clamp(num, min, max) {
        return Math.max(Math.min(num, max), min)
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

    //Rick object
    class Rick {
        constructor(x=0, y=0, velocity=[0,0], hp=5) {
            this.x = x;
            this.y = y;
            this.maxHP = hp;
            this.hp = hp;
            this.velocity = {'x': velocity[0], 'y': velocity[1]};
            this.airborn = false;
            this.#init();
        }

        //Adds object to page and ricks array
        spawn() {
            document.getElementById('rick-container').appendChild(this.container);
            ricks.push(this);
        }

        //Deletes object's html component and itself from the ricks array
        delete() {
            this.container.remove();
            let index = ricks.indexOf(this);
            if (index != -1) ricks.splice(index, 1);
        }

        //Runs when object gets 'hurt'
        hurt(dmg) {
            this.gif.classList.add('rick-hurt');
            this.hp -= dmg;
            this.healthBar.innerText = `HP:${this.hp}/${this.maxHP}`
            this.healthBar.style.textShadow = '-1px -1px 0 ' + this.getHPColor();
            if (this.hp <= 0) {
                this.die();
            }
        }

        getHPColor() {
            let percent = this.hp / this.maxHP;
            return `rgb(${clamp(255 * (1 - percent) * 2, 0, 255)}, ${clamp(255 * percent * 2, 0, 255)}, 0)`;
        }

        //Returns info relating to client boundingBox
        getBox() {
            return this.container.getBoundingClientRect();
        }
        getTop() {
            return this.getBox().top;
        }
        getBottom() {
            return this.getBox().bottom;
        }
        getLeft() {
            return this.getBox().left;
        }
        getRight() {
            return this.getBox().right;
        }

        //Handles that happens when object container is clicked
        #clickHandler(e) {
            this.velocity.y += -20;
            this.velocity.x += (this.getCenter().x - e.clientX) * .4;
            this.hurt(1);
            combo += 1;
            this.updateCombo();
        }

        updateCombo() {
            document.querySelector('.combo').innerText = `Combo: ${combo}`;
        }

        //Initiates death of object
        die() {
            score++;
            this.gif.classList.add('rick-dying');
            this.container.style.pointerEvents = 'none';
            scoreDisplay.innerText = `Ricks Defeated: ${score}`;
        }

        //Handles animation endings
        animationHandler(e) {
            let animationName = e.animationName;
            if (animationName === 'rick-die') {
                this.delete();
            } else if (animationName === 'rick-spawn') {
                this.#physicsLoop();
                this.container.classList.remove('rick-spawning');
            } else if (animationName === 'rick-hurt') {
                this.gif.classList.remove('rick-hurt');
            }
        }

        //Returns if this object still exists
        exists() {
            return (ricks.indexOf(this) != -1);
        }

        //Returns if object is touching the left side of screen
        touchingWallL() {
            return (this.getLeft() <= 0);
        }

        //Returns if object is touching the right side of screen
        touchingWallR() {
            return (this.getRight() >= window.innerWidth);
        }
        
        //Returns if object is touching the top of screen
        touchingWallT() {
            return (this.getTop() <= 0);
        }

        //Returns if object is touching the bottom of screen
        touchingWallB() {
            return (this.getBottom() >= window.innerHeight);
        }

        //Returns width of object
        getWidth() {
            return this.getBox().width;
        }

        //Returns height of object
        getHeight() {
            return this.getBox().height;
        }

        //Returns center of object
        getCenter() {
            let centerX = this.getLeft() + this.getWidth() / 2;
            let centerY = this.getTop() + this.getHeight() / 2;
            return {'x': centerX, 'y': centerY};
        }

        //Updates object's position
        updatePos() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.x = clamp(this.x, 0, window.innerWidth - this.getWidth());
            this.y = clamp(this.y, 0, window.innerHeight - this.getHeight());

            if (this.touchingWallB() && this.velocity.y > 0 && combo > 0) {
                combo = 0;
                this.updateCombo();
            }

            if (this.touchingWallL() && this.velocity.x < 0) this.velocity.x = 0;
            if (this.touchingWallR() && this.velocity.x > 0) this.velocity.x = 0;
            if (this.touchingWallT() && this.velocity.y < 0) this.velocity.y = 0;
            if (this.touchingWallB() && this.velocity.y > 0) {
                this.velocity.y = 0;
                if (this.airborn) this.airborn = false;
            }
            this.container.style.left = `${this.x}px`;
            this.container.style.top= `${this.y}px`;
        }

        //Calculates velocity with gravity
        gravity() {
            if (this.getBottom() < window.innerHeight) {
                this.velocity.y += 1;
            }
        }

        //Calculates velocity with friction
        friction() {
            this.velocity.x *= 0.9;
            this.velocity.y *= 0.98;
        }

        //Initializes object
        #init() {
            let gif = document.createElement('img');
            let container = document.createElement('div');
            let healthBar = document.createElement('p');
            this.gif = gif;
            this.container = container;
            this.healthBar = healthBar;
            gif.src = 'Images/rick-gif.gif';
            gif.alt = 'Rick Astley dancing';
            gif.classList.add('rick-gif');
            container.classList.add('rick-box');
            container.classList.add('rick-spawning');
            healthBar.classList.add('rick-hp');
            container.appendChild(healthBar);
            container.appendChild(gif);
            this.spawn();
            this.container.style.left = `${this.x}px`;
            this.container.style.top= `${this.y}px`;
            this.container.addEventListener('mousedown', e => this.#clickHandler(e));
            this.gif.addEventListener('animationend', e => this.animationHandler(e));
            this.container.addEventListener('animationend', e => this.animationHandler(e));
        }

        //Calculates position of object with physics in consideration
        async #physicsLoop() {
            while (this.exists()) {
                this.gravity();
                this.friction();
                this.updatePos();
                await sleep(20);
            }
        }

    }

    //Creates a rick instance (and scoreboard if first rick created)
    function createRick() {
        if (ricksCreated === 0) {
            scoreDisplay = document.createElement('p');
            scoreDisplay.classList.add('score');
            scoreDisplay.innerText = 'Ricks Defeated: 0';
            comboDisplay = document.createElement('p');
            comboDisplay.classList.add('combo');
            comboDisplay.innerText = 'Combo: 0';
            document.querySelector('.score-board').appendChild(scoreDisplay);
            document.querySelector('.score-board').appendChild(comboDisplay);
        }

        ricksCreated++;
        let newRick = new Rick(
            Math.random() * (window.innerWidth - 169/2),
            getWindowCenter()[1] - 189/2,
            [0, 0],
            ricksCreated + 1
        );
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

        if (btn.id === 'roll') {
            createRick();
        }

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
        }
        else if (btn.id === 'brain') {
            brainRotCertificate.generate();
        }

        updateText();
    }

    //Updates certificate text when user inputs
    function inputHandler(e) {
        let textValue = e.target.value;
        let id = e.target.id;
        document.getElementById(id.substring(6)).innerText = textValue || ' ';
        updateText('read');
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
