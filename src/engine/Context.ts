
export class GLContext
{
	private static canvas : HTMLCanvasElement;
	public static gl : WebGLObject;

	public static initialize(canvas : HTMLCanvasElement) : WebGLObject
	{
		this.gl = canvas.getContext("webgl2");
		if (!this.gl)
		{
			console.warn("WebGL2 Context could not be fetched");
		}
		return this.gl;
	}
}
