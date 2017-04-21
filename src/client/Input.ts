
export class Input
{
	private static _mouse = {x: 0, y:0};

	public static get mouse() { return {x: Input._mouse.x, y: Input._mouse.y, left: false, right: false, middle: false, scroll: 0}; }

	public static initialize()
	{
		window.addEventListener("mousemove", (e) => {
			Input._mouse.x = e.clientX;
			Input._mouse.y = e.clientY;
		});
	}
}
