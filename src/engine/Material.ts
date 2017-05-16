
import { Shader } from "./Shader";
import { Engine } from "./Engine";

export class Material
{
	private shaderProgram : WebGLProgram;
	private vertexShader : Shader;
	private fragmentShader : Shader;

	private positionAttributeLocation : number;

	constructor(vertexShader : Shader, fragmentShader : Shader)
	{
		let gl = Engine.GL;
		if (vertexShader.type !== Shader.ShaderType.VERTEX)
		{
			throw Error("vertexShader is not of type VERTEX");
		}
		if (fragmentShader.type !== Shader.ShaderType.FRAGMENT)
		{
			throw Error("fragmentShader is not of type FRAGMENT");
		}

		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, vertexShader.getShader());
		gl.attachShader(this.shaderProgram, fragmentShader.getShader());
		gl.linkProgram(this.shaderProgram);

		if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS))
		{
			throw new Error("Unable to initialize shader program: " + gl.getProgramInfoLog(this.shaderProgram));
		}

		this.positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "position");
		gl.enableVertexAttribArray(this.positionAttributeLocation);
	}

	public getPositionAttributeLocation()
	{
		return this.positionAttributeLocation;
	}

	public getProgram()
	{
		return this.shaderProgram;
	}
}
