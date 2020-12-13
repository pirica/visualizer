let module = null;
let handler = null;

class ModuleData {}

class Module {
    constructor({
        name,
        description,
        head,
        body,
        modules,
        image,
        background
    }) {
        this.name = name;
        this.description = description;
        this.body = body;
        this.head = head;
        this.modules = modules;
        this.background = background;
        this.image = image;
        this.data = new ModuleData();
    }

    execute() {
        return this.modules.execute(this);
    }

    destory() {
        this.while(this, (key) => delete this[key], true);
    }
}

class Modules {
    constructor(modules) {
        this.log(`Grabbed all the modules.`);
        this.element = $('.modules');
        this.executed = null;
        this.element.empty();
        this.modulesWithErrors = [];
        this.log(`Emptied old modules.`);

        this.mobile = typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1;

        this.modules = this.sort(modules);

        this.handler = (e) => {
            if(module) {
                $('#page')[0].innerHTML = `<div class="error"><div>Module Error</div><div>${e.statusText || e.message} ${e.url ? `(${e.url})` : ''}</div><div>Switch to a different module, also contact me about this.</div></div>`;

                this.modulesWithErrors.push({
                    name: module.name,
                    error: e
                });
            }
        }

        handler = this.handler;

        this.errorHandler = new ErrorHandler(this.handler);
    }

    log(message) {
        console.log('%c[Modules]', 'color: #7289DA', message);
    }

    set(m) {
        module = m;
        this.log(`Set the "module" window class to the current module selected.`);
    }

    async execute(module) {
        $('.art').fadeOut();

        const element = $(`#${module.name}`)[0];

        if(this.executed == module) {
            this.log(`Showing all the modules to be able to switch.`);
            $('.modules').children().not('[type="active"]').css('display', '');
            $('.modules').children().not('[type="active"]').css('transform', '');
            $('.modules').children().not('[type="active"]').css('width', '');
            return;
        }

        $('html').css('background', '');
        this.set(module);

        const { head: headData, body, background } = module;

        if($('head')[1]) $('head')[1].remove();

        const head = document.createElement('head');

        document.children[0].appendChild(head);
        
        const startingMS = performance.now();

        $('#page')[0].innerHTML = body;

        this.log(`Executing ${module.name}.`);
        
        this.while(headData, ({
            type,
            data
        }) => {
            const element = document.createElement(type);

            this.while(data, ({
                type,
                value
            }) => element.setAttribute(type, value));

            head.appendChild(element);
        });

        const ms = performance.now() - startingMS;
        this.log(`Executed ${module.name} at ${ms.toFixed(2)}ms.`);

        if($('.modules')[0].classList[1] === 'early') {
            $('.modules')[0].classList.remove('early');
            this.log(`Shrinked modules to the top right side.`);
        }

        if($('[type="active"]')[0]) $('[type="active"]')[0].removeAttribute('type');
        element.setAttribute('type', 'active');
        element.style.width = '';
        element.style.transform = 'perspective(245px) rotateY(-23deg)';
        $('.modules').children().not('[type="active"]').css('width', '0');

        if(this.mobile) {
            const path = `./src/${module.name.toLowerCase()}/mobile.css`;
            if(await exist(path)) {
                const element = document.createElement('link');
                element.rel = 'stylesheet';
                element.href = path;
    
                head.appendChild(element);
            }
        }

        if($('.background')[0]) $('.background')[0].remove();

        if(background) {
            const element = document.createElement('div');
            element.classList.add('background');
            element.style.background = background;

            document.body.appendChild(element);
        }
        
        this.executed = module;
    }

    sort(modules) {
        const ModulesC = [];
        this.while(modules, (e) => {
            const startingMS = performance.now();
            const module = new Module({
                ...e,
                modules: this
            });
            ModulesC.push(module);

            const div = document.createElement('div');
            div.id = module.name;

            if(module.image) {
                div.innerHTML = `<div style="-webkit-mask-box-image: url(https://fortnite-api.com/images/cosmetics/br/cid_883_athena_commando_m_chonejonesy/icon.png);"></div>`;
            }

            div.onclick = () => module.execute();

            this.element[0].appendChild(div);

            this.log(`Completed ${module.name} at ${(performance.now() - startingMS).toFixed(2)}ms.`);
        });

        this.log(`Sorted and added all the modules.`);

        return ModulesC;
    }

    while(array, func, keys=false) {
        let length = keys ? Object.keys(array).length : array.length;
        
        while(length--) func(keys ? Object.keys(array)[length] : array[length], length);
    }
}