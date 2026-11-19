export default function ProductTableHead() {
  return (
    <thead>
      <tr>
        <th
          style={{
            width: '60px',
            padding: 'var(--admin-space-sm) var(--admin-space-md)',
            fontSize: 'var(--admin-size-micro)',
            fontWeight: 'var(--admin-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--admin-text-tertiary)',
            borderBottom:
              '1px solid var(--admin-border-subtle)',
          }}
        >
          Image
        </th>
        <th
          style={{
            padding: 'var(--admin-space-sm) var(--admin-space-md)',
            fontSize: 'var(--admin-size-micro)',
            fontWeight: 'var(--admin-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--admin-text-tertiary)',
            borderBottom:
              '1px solid var(--admin-border-subtle)',
          }}
        >
          Name
        </th>
        <th
          style={{
            padding: 'var(--admin-space-sm) var(--admin-space-md)',
            fontSize: 'var(--admin-size-micro)',
            fontWeight: 'var(--admin-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--admin-text-tertiary)',
            borderBottom:
              '1px solid var(--admin-border-subtle)',
          }}
        >
          Category
        </th>
        <th
          style={{
            padding: 'var(--admin-space-sm) var(--admin-space-md)',
            fontSize: 'var(--admin-size-micro)',
            fontWeight: 'var(--admin-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--admin-text-tertiary)',
            borderBottom:
              '1px solid var(--admin-border-subtle)',
            textAlign: 'right',
          }}
        >
          Price
        </th>
        <th
          style={{
            padding: 'var(--admin-space-sm) var(--admin-space-md)',
            fontSize: 'var(--admin-size-micro)',
            fontWeight: 'var(--admin-weight-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--admin-text-tertiary)',
            borderBottom:
              '1px solid var(--admin-border-subtle)',
          }}
        >
          Status
        </th>
      </tr>
    </thead>
  );
}
