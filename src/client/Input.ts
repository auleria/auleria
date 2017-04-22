export class Input
{
	private static _mouse = {
		x: 0, y:0, left: false, right: false, middle: false, scroll: 0
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
	}
}
