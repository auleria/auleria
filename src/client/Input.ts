export class Input
{
	private static _mouse = {
		x: 0, y:0, left: false, right: false, middle: false, scroll: 0
	};

	private static keymap = {
		Forward: "w",
		Backward: "s",
		TurnLeft: "ArrowLeft",
		TurnRight: "ArrowRight",
		StrafeLeft: "a",
		StrafeRight: "d",
		Sprint: "Shift",
		Jump: " ",
		Menu: "Escape",
		Confirm: "Enter",
		Up: "ArrowUp",
		Down: "ArrowDown",
		Left: "ArrowLeft",
		Right: "ArrowRight"
	};

	private static gamepad : Gamepad;
	private static gamepadTimestamp : number = 0;

	public static keys = {
		Forward: 0,
		Backward: 0,
		TurnLeft: 0,
		TurnRight: 0,
		StrafeLeft: 0,
		StrafeRight: 0,
		Sprint: 0,
		Jump: 0,
		Menu: 0,
		Confirm: 0,
		Up: 0,
		Down: 0,
		Left: 0,
		Right: 0
	};

	private static gamepadmap = {
		Forward: {
			axis: 1,
			test: (n : number) => n < 0,
			transform: (n : number) => -n
		},
		Backward: {
			axis: 1,
			test: (n : number) => n > 0
		},
		StrafeRight: {
			axis: 0,
			test: (n : number) => n > 0
		},
		StrafeLeft: {
			axis: 0,
			test: (n : number) => n < 0,
			transform: (n : number) => -n
		},
		TurnRight: {
			axis: 2,
			test: (n : number) => n > 0
		},
		TurnLeft: {
			axis: 2,
			test: (n : number) => n < 0,
			transform: (n : number) => -n
		},
		Sprint: {
			button: 7
		}
	};

	private static gamepads = new Array<Gamepad>();

	public static get mouse() { return {x: Input._mouse.x, y: Input._mouse.y, left: Input._mouse.left, right: Input._mouse.right, middle: Input._mouse.middle, scroll: Input._mouse.scroll}; }

	public static initialize()
	{
		window.addEventListener("gamepadconnected", (e : GamepadEvent) => {
			Input.gamepads.push(e.gamepad);
			if (e.gamepad !== null && /Xbox/.test(e.gamepad.id))
			{
				this.gamepad = e.gamepad;
			}
			console.log("Gamepad connected",  e.gamepad.id);
		});

		Input.updateGamepads();

		window.addEventListener("mousemove", (e) => {
			Input._mouse.x = e.clientX;
			Input._mouse.y = e.clientY;
		});

		let handleMouseDown = (e:MouseEvent) => {
			if ((e.target as HTMLElement).nodeName.toLowerCase() !== "canvas")
			{
				return;
			}
			e.preventDefault();
			Input._mouse.left =  (e.buttons & 1) === 1;
			Input._mouse.right =  (e.buttons & 2) === 2;
			Input._mouse.middle =  (e.buttons & 4) === 4;
		};
		window.addEventListener("contextmenu", (e) => (e.target as HTMLElement).nodeName.toLowerCase() !== "canvas" ? null : e.preventDefault());
		window.addEventListener("mousedown", (e) => handleMouseDown(e));

		window.addEventListener("mouseup", (e) => {
			Input._mouse.left =  (e.buttons & 1) === 1;
			Input._mouse.right =  (e.buttons & 2) === 2;
			Input._mouse.middle =  (e.buttons & 4) === 4;
		});

		window.addEventListener("keydown", (e) => this.handleKeyDown(e));
		window.addEventListener("keyup", (e) => this.handleKeyUp(e));
	}

	private static updateGamepads()
	{
		let gps = Array.from(navigator.getGamepads());
		let gamepad = gps.find((gp) => gp !== null && /Xbox/.test(gp.id));
		if (gamepad)
		{
			if (this.gamepadTimestamp !== gamepad.timestamp)
			{
				for (var inputName in Input.gamepadmap)
				{
					let input = (Input.gamepadmap as any)[inputName];
					if (input.axis !== undefined)
					{
						if (input.test(gamepad.axes[input.axis]))
						{
							(this.keys as any)[inputName] = input.transform ? input.transform(gamepad.axes[input.axis]) : gamepad.axes[input.axis];
						}
						else
						{
							(this.keys as any)[inputName] = 0;
						}
					}
					else if (input.button !== undefined)
					{
						(this.keys as any)[inputName] = gamepad.buttons[input.button].value;
					}
				}
			}
			this.gamepadTimestamp = gamepad.timestamp;
		}
		requestAnimationFrame(() => Input.updateGamepads());
	}

	private static handleKeyDown(event : KeyboardEvent)
	{
		let charCode = event.charCode || event.keyCode || event.which;
		for (let input in this.keymap)
		{
			let key = (this.keymap as any)[input] as string;
			if (event.key.toLowerCase() === key.toLowerCase())
			{
				event.preventDefault();
				(this.keys as any)[input] = 1;
				break;
			}
		}
	}

	private static handleKeyUp(event : KeyboardEvent)
	{
		for (let input in this.keymap)
		{
			let key = (this.keymap as any)[input] as string;
			if (event.key.toLowerCase() === key.toLowerCase())
			{
				event.preventDefault();
				(this.keys as any)[input] = 0;
				break;
			}
		}
	}
}
