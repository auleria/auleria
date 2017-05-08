export class Input
{
	private static _mouse = {
		x: 0, y:0, left: false, right: false, middle: false, scroll: 0
	};

	private static keymap = {
		Forward: "w",
		Backward: "s",
		TurnLeft: "",
		TurnRight: "",
		StrafeLeft: "a",
		StrafeRight: "d",
		Jump: " ",
		Menu: "Escape",
		Confirm: "Enter",
		Up: "ArrowUp",
		Down: "ArrowDown",
		Left: "ArrowLeft",
		Right: "ArrowRight"
	};

	public static keys = {
		Forward: false,
		Backward: false,
		TurnLeft: false,
		TurnRight: false,
		StrafeLeft: false,
		StrafeRight: false,
		Jump: false,
		Menu: false,
		Confirm: false,
		Up: false,
		Down: false,
		Left: false,
		Right: false
	};

	public static get mouse() { return {x: Input._mouse.x, y: Input._mouse.y, left: Input._mouse.left, right: Input._mouse.right, middle: Input._mouse.middle, scroll: Input._mouse.scroll}; }

	public static initialize()
	{
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

	private static handleKeyDown(event : KeyboardEvent)
	{
		for (let input in this.keymap)
		{
			let key = (this.keymap as any)[input] as string;
			if (event.key === key)
			{
				(this.keys as any)[input] = true;
				break;
			}
		}
	}

	private static handleKeyUp(event : KeyboardEvent)
	{
		for (let input in this.keymap)
		{
			let key = (this.keymap as any)[input] as string;
			if (event.key === key)
			{
				(this.keys as any)[input] = false;
				break;
			}
		}
	}
}
