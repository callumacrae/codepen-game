import Character from '../character';

const isColliding = (a: Character, b: Character) => {
  const aPosition = a.getRealPosition();
  const bPosition = b.getRealPosition();

  if (!aPosition || !bPosition) {
    return false;
  }

  return (
    Math.abs(aPosition[0] - bPosition[0]) < 1 &&
    Math.abs(aPosition[1] - bPosition[1]) < 1
  );
};

export default isColliding;
