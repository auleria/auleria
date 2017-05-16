
export class Engine
{
	private gl : WebGL2RenderingContext;
	public static GL : WebGL2RenderingContext;
	constructor(canvas : HTMLCanvasElement)
	{
		this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
		if (!this.gl)
		{
			console.warn("WebGL2 Context could not be fetched");
		}
		Engine.GL = this.gl;
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}

	public clear()
	{
		// TODO: RENDER SCENES HERE
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
	}
}
