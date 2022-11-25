const states = {
	ADDING: 0,
	DELETING: 1,
	IDLE: 2
};

class RotatesStates extends EventTarget {
	constructor() {
		super();
		this.values = [];
		this.lastState = states.ADDING;
		this.tickEvent = new CustomEvent("tick");
	}

	init = () => this.dispatchEvent(this.tickEvent);

	add = (index, value) => {
		this.values[index] = { state: states.ADDING, loopNum: 0, ...value };
	};

	get = (index) => this.values[index];

	set = (index, value) => {
		const oldValue = this.get(index);
		this.values[index] = { ...oldValue, ...value };
		if (this.values.every((val) => val.state === states.IDLE)) {
			this.restart();
		}
	};

	restart = () => {
		const state =
			this.lastState === states.ADDING ? states.DELETING : states.ADDING;
		this.lastState = state;

		this.values = this.values.map((value) => {
			let loopNum = value.loopNum;
			if (state === states.ADDING) loopNum += 1;
			return { ...value, state, loopNum };
		});

		const delta = state === states.ADDING ? 500 : 2000;

		setTimeout(() => {
			this.init();
		}, delta);
	};
}

class Tick {
	constructor(id, states) {
		this.id = id;
		this.states = states;
		states.addEventListener("tick", () => this.tick());
	}

	tick() {
		const { loopNum, state, rotates, id, text, element, period } =
			this.states.get(this.id);

		const index = loopNum % rotates.length;
		const fullText = rotates[index];

		const op = state === states.ADDING ? 1 : -1;
		const newText = fullText.substring(0, text.length + op);
		this.states.set(id, { text: newText });

		element.innerHTML = `<span class="wrap">${newText}</span>`;

		let delta = period / fullText.length;
		if (state === states.DELETING) {
			delta /= 2;
		}

		if (newText === fullText || newText === "") {
			this.states.set(id, { state: states.IDLE });
		} else {
			setTimeout(() => {
				this.tick();
			}, delta);
		}
	}
}

window.onload = function () {
	const elements = document.getElementsByClassName("txt-rotate");
	const rotatesStates = new RotatesStates();

	for (let i = 0; i < elements.length; i++) {
		const element = elements[i];
		const values = element.getAttribute("data-rotate");
		const value = {
			id: i,
			element,
			rotates: JSON.parse(values),
			text: "",
			period: i === 0 ? 5000 : 3000
		};
		rotatesStates.add(i, value);
		new Tick(i, rotatesStates);
	}
	rotatesStates.init();
};
