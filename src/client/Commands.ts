
export class Commands
{
	private static commands = new Map<string, Function>();

	public static register(name : string, func : Function)
	{
		Commands.commands.set(name, func);
	}

	public static do(name : string, ...args : any[])
	{
		let command = Commands.commands.get(name);
		if (command)
		{
			command(...args);
		}
		else
		{
			console.warn(command, "does not exist");
		}
	}
}

// tslint:disable-next-line:curly
// tslint:disable-next-line:no-invalid-this
if (!isWorker())
	(window as any)["do"] = Commands.do;

function isWorker()
{
	return typeof importScripts === "function";
}