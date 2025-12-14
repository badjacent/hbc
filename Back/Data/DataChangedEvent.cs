namespace Back.Data
{
    public class DataChangedEvent<T>
    {
        public ChangeType Type { get; set; }
        public T Payload { get; set; }
    }

    public enum ChangeType
    {
        Added,
        Updated,
        Deleted
    }
}