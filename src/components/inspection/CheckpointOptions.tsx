// Inside CheckpointOptions.tsx

const CheckpointOptions: React.FC<CheckpointOptionsProps> = ({
  passed,
  onStatusChange,
  disabled = false
}) => {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant={passed === true ? "default" : "outline"}
        className={passed === true ? "bg-green-500 hover:bg-green-600" : ""}
        onClick={() => onStatusChange(true)}
        disabled={disabled}
      >
        <Check className="h-4 w-4 mr-1" />
        Pass
      </Button>

      <Button
        type="button"
        size="sm"
        variant={passed === false ? "default" : "outline"}
        className={passed === false ? "bg-red-500 hover:bg-red-600" : ""}
        onClick={() => onStatusChange(false)}
        disabled={disabled}
      >
        <X className="h-4 w-4 mr-1" />
        Fail
      </Button>

      <Button
        type="button"
        size="sm"
        variant={passed === null ? "default" : "outline"}
        className={passed === null ? "bg-gray-500 hover:bg-gray-600" : ""}
        onClick={() => onStatusChange(null)}
        disabled={disabled}
      >
        <Minus className="h-4 w-4 mr-1" />
        N/A
      </Button>
    </div>
  );
};

export default CheckpointOptions;
