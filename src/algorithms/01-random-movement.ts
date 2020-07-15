import { Command, InstructionFnType } from '../character';

const randomMovement: InstructionFnType = (
  { previousCommands, availableCommands },
  { random }
) => {
  const previousCommand = previousCommands[previousCommands.length - 1];
  const oppositeCommand = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  }[previousCommand] as Command;

  if (oppositeCommand && availableCommands.length > 1) {
    availableCommands.splice(availableCommands.indexOf(oppositeCommand), 1);
  }

  return random.pick(availableCommands);
};

export default randomMovement;
