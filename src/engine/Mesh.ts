
import { Geometry } from "./Geometry";
import { Material } from "./Material";
import { Engine } from "./Engine";

export class Mesh
{
	private geometry : Geometry;
	private material : Material;

	constructor(geometry : Geometry, material : Material)
	{
		this.geometry = geometry;
		this.material = material;
	}

	public draw()
	{
		let gl = Engine.GL;
		gl.useProgram(this.material.getProgram());
		gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
		gl.vertexAttribPointer(this.material.getPositionAttributeLocation(), 3, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}
