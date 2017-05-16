attribute vec3 position;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void)
{
	gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
}