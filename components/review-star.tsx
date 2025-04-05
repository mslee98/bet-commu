type Rating = { rating: number };

interface StarRatingProps {
  ratings: Rating[];
}

const getStarCounts = (ratings: Rating[] = []) => {
  if (ratings.length === 0) {
    return { full: 0, decimal: 0, empty: 5 };
  }

  const total = ratings.reduce((sum, r) => sum + r.rating, 0);
  const avg = total / ratings.length;
  const roundedAvg = parseFloat(avg.toFixed(1));

  const full = Math.floor(roundedAvg);
  const decimal = roundedAvg % 1;
  const empty = 5 - full - (decimal > 0 ? 1 : 0);

  return { full, decimal, empty };
};

const StarRating: React.FC<StarRatingProps> = ({ ratings }) => {
  const { full, decimal, empty } = getStarCounts(ratings);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, index) => (
        <StarIcon key={`full-${index}`} type="full" />
      ))}

      {decimal > 0 && <StarIcon type="decimal" decimal={decimal} />}

      {Array.from({ length: empty }).map((_, index) => (
        <StarIcon key={`empty-${index}`} type="empty" />
      ))}
    </div>
  );
};

const StarIcon = ({
  type,
  decimal,
}: {
  type: "full" | "decimal" | "empty";
  decimal?: number;
}) => {
  const basePath =
    "M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z";

  if (type === "decimal") {
    const offset = `${(decimal ?? 0) * 100}%`;

    return (
      <svg
        className="w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <defs>
          <linearGradient id="partialStarGradient">
            <stop offset={offset} stopColor="currentColor" />
            <stop offset={offset} stopColor="#cbcfd5" />
          </linearGradient>
        </defs>
        <path fill="url(#partialStarGradient)" d={basePath} />
      </svg>
    );
  }

  const color =
    type === "full" ? "text-yellow-300" : type === "empty" ? "text-gray-300" : "";

  return (
    <svg
      className={`w-4 h-4 ${color}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={basePath} />
    </svg>
  );
};

export default StarRating;
