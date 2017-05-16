
import { Engine } from "./Engine";
enum ShaderType { VERTEX, FRAGMENT };

export class Shader
{
	private raw : string;
	private shader : WebGLShader;
	public type : ShaderType;

	public static ShaderType = ShaderType;

	constructor(type : ShaderType, shader : string)
	{
		this.type = type;
		this.raw = shader;
		this.shader = Engine.GL.createShader(this.type === ShaderType.FRAGMENT ? Engine.GL.FRAGMENT_SHADER : Engine.GL.VERTEX_SHADER);
		Engine.GL.shaderSource(this.shader, this.raw);
		Engine.GL.compileShader(this.shader);

		if (!Engine.GL.getShaderParameter(this.shader, Engine.GL.COMPILE_STATUS))
		{
			throw new Error("An error ocurred compiling shaders:" + Engine.GL.getShaderInfoLog(this.shader));
		}
	}

	public getShader()
	{
		return this.shader;
	}

	public getRaw()
	{
		return this.raw;
	}
}
