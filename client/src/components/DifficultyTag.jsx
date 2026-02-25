export default function DifficultyTag({ difficulty }) {
  const classes = {
    Beginner: 'tag-beginner',
    Intermediate: 'tag-intermediate',
    Advanced: 'tag-advanced',
  };
  return <span className={classes[difficulty] || 'tag-beginner'}>{difficulty}</span>;
}
