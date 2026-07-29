const availabilityStyles = {
	'Online': {
		background: 'rgba(34, 197, 94, 0.16)',
		color: '#86efac',
		border: '1px solid rgba(34, 197, 94, 0.22)',
	},
	'In-person': {
		background: 'rgba(56, 189, 248, 0.16)',
		color: '#7dd3fc',
		border: '1px solid rgba(56, 189, 248, 0.24)',
	},
	Online: {
		background: 'rgba(251, 191, 36, 0.16)',
		color: '#fde68a',
		border: '1px solid rgba(251, 191, 36, 0.24)',
	},
	'Online / In-person': {
		background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.16), rgba(56, 189, 248, 0.16))',
		color: '#dbeafe',
		border: '1px solid rgba(148, 163, 184, 0.2)',
	},
}

function DoctorCard({
	doctorName,
	qualification,
	hospitalName,
	specializationTags,
	city,
	availability,
	officialProfileUrl,
	appointmentUrl,
}) {
	const availabilityStyle = availabilityStyles[availability] || availabilityStyles['Online / In-person']

	return (
		<article
			style={{
				borderRadius: 24,
				padding: '1.25rem',
				background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(8, 15, 26, 0.94))',
				border: '1px solid rgba(148, 163, 184, 0.16)',
				boxShadow: '0 18px 40px rgba(2, 6, 23, 0.38)',
				display: 'grid',
				gap: '0.95rem',
				height: '100%',
				backdropFilter: 'blur(12px)',
				transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
			}}
			onMouseEnter={(event) => {
				event.currentTarget.style.transform = 'translateY(-4px)'
				event.currentTarget.style.boxShadow = '0 24px 52px rgba(2, 6, 23, 0.48)'
				event.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.24)'
			}}
			onMouseLeave={(event) => {
				event.currentTarget.style.transform = 'translateY(0)'
				event.currentTarget.style.boxShadow = '0 18px 40px rgba(2, 6, 23, 0.38)'
				event.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.16)'
			}}
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
					<div style={{ display: 'grid', gap: 6 }}>
						<p style={{ margin: 0, color: '#f8fafc', fontSize: 20, fontWeight: 700, lineHeight: 1.2, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
							{doctorName}
						</p>
						<p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>
							{qualification}
						</p>
					</div>
					<span
						style={{
							padding: '0.45rem 0.75rem',
							borderRadius: 999,
							fontSize: 12,
							fontWeight: 600,
							whiteSpace: 'nowrap',
							...availabilityStyle,
						}}
					>
						{availability}
					</span>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#fbbf24' }}>Hospital</span>
					<span style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 1.5 }}>{hospitalName}</span>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#fbbf24' }}>Specialization</span>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{specializationTags.map((tag) => (
							<span
								key={tag}
								style={{
									padding: '0.4rem 0.7rem',
									borderRadius: 999,
									background: 'rgba(251, 191, 36, 0.12)',
									border: '1px solid rgba(251, 191, 36, 0.18)',
									color: '#fde68a',
									fontSize: 12,
									lineHeight: 1,
								}}
							>
								{tag}
							</span>
						))}
					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', color: '#94a3b8', fontSize: 13 }}>
					<span>{city}</span>
					<span>{availability}</span>
				</div>
			</div>

			<div style={{ display: 'grid', gap: 10, marginTop: 'auto' }}>
				<a
					href={officialProfileUrl}
					target="_blank"
					rel="noreferrer"
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0.85rem 1rem',
						borderRadius: 14,
						background: 'rgba(15, 118, 110, 0.18)',
						border: '1px solid rgba(45, 212, 191, 0.24)',
						color: '#99f6e4',
						textDecoration: 'none',
						fontWeight: 600,
						transition: 'transform 160ms ease, background 160ms ease',
					}}
					onMouseEnter={(event) => {
						event.currentTarget.style.transform = 'translateY(-1px)'
						event.currentTarget.style.background = 'rgba(15, 118, 110, 0.26)'
					}}
					onMouseLeave={(event) => {
						event.currentTarget.style.transform = 'translateY(0)'
						event.currentTarget.style.background = 'rgba(15, 118, 110, 0.18)'
					}}
				>
					View Official Profile
				</a>
				<a
					href={appointmentUrl}
					target="_blank"
					rel="noreferrer"
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0.85rem 1rem',
						borderRadius: 14,
						background: 'linear-gradient(135deg, #fbbf24, #fb7185)',
						border: '1px solid rgba(251, 191, 36, 0.16)',
						color: '#111827',
						textDecoration: 'none',
						fontWeight: 700,
						transition: 'transform 160ms ease, filter 160ms ease',
					}}
					onMouseEnter={(event) => {
						event.currentTarget.style.transform = 'translateY(-1px)'
						event.currentTarget.style.filter = 'brightness(1.03)'
					}}
					onMouseLeave={(event) => {
						event.currentTarget.style.transform = 'translateY(0)'
						event.currentTarget.style.filter = 'brightness(1)'
					}}
				>
					Book Appointment
				</a>
			</div>
		</article>
	)
}

export default DoctorCard