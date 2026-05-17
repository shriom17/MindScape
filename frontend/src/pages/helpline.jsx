import { pageBgStyles } from '../styles/pageBackground'

const psychologists = [
	{
		name: 'Dr. A. Rahman (Sample)',
		role: 'Clinical Psychologist',
		focus: 'Anxiety, trauma, sleep',
		phone: '01XX-XXXXXXX',
		hours: 'Sat-Thu, 10:00am-6:00pm',
		mode: 'Online + In-person',
		location: 'Dhaka',
	},
	{
		name: 'Dr. S. Karim (Sample)',
		role: 'Child Psychologist',
		focus: 'Adolescents, family therapy',
		phone: '01XX-XXXXXXX',
		hours: 'Sun-Thu, 11:00am-7:00pm',
		mode: 'Online',
		location: 'Chattogram',
	},
	{
		name: 'Dr. N. Farah (Sample)',
		role: 'Counseling Psychologist',
		focus: 'Stress, burnout, self-esteem',
		phone: '01XX-XXXXXXX',
		hours: 'Sat-Wed, 9:00am-4:30pm',
		mode: 'In-person',
		location: 'Sylhet',
	},
]

const counselors = [
	{
		name: 'M. Hasan (Sample)',
		role: 'Licensed Counselor',
		focus: 'Relationship support, grief',
		phone: '01XX-XXXXXXX',
		hours: 'Sat-Thu, 12:00pm-8:00pm',
		mode: 'Online',
		location: 'Rajshahi',
	},
	{
		name: 'T. Iqbal (Sample)',
		role: 'Mental Health Counselor',
		focus: 'Mood support, coping skills',
		phone: '01XX-XXXXXXX',
		hours: 'Sun-Thu, 9:30am-5:30pm',
		mode: 'Online + In-person',
		location: 'Khulna',
	},
	{
		name: 'N. Jahan (Sample)',
		role: 'Career Counselor',
		focus: 'Career stress, study pressure',
		phone: '01XX-XXXXXXX',
		hours: 'Sat-Wed, 3:00pm-9:00pm',
		mode: 'Online',
		location: 'Barishal',
	},
]

const cardBase = {
	borderRadius: 18,
	padding: '1.1rem 1.2rem',
	background: 'rgba(8, 20, 33, 0.72)',
	border: '1px solid rgba(255, 255, 255, 0.12)',
	boxShadow: '0 10px 24px rgba(2, 8, 23, 0.35)',
	display: 'grid',
	gap: 10,
	animation: 'rise 0.6s ease both',
}

const labelBase = {
	fontSize: 12,
	letterSpacing: '0.35px',
	textTransform: 'uppercase',
	color: '#eab308',
}

const valueBase = {
	color: '#e2e8f0',
	fontSize: 14,
}

const SectionHeader = ({ title, subtitle, accent }) => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
		<h2
			style={{
				margin: 0,
				fontSize: '1.6rem',
				color: accent,
				fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
			}}
		>
			{title}
		</h2>
		<p style={{ margin: 0, color: '#cbd5f5', fontSize: 14 }}>{subtitle}</p>
	</div>
)

function Helpline() {
	return (
		<div style={pageBgStyles.page}>
			<div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
			<div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />
			<div
				style={{
					position: 'absolute',
					width: 260,
					height: 260,
					borderRadius: 999,
					right: '18%',
					bottom: '-10%',
					background: 'rgba(14, 165, 233, 0.16)',
					filter: 'blur(2px)',
					pointerEvents: 'none',
				}}
			/>

			<section style={{ ...pageBgStyles.shell, maxWidth: 1100 }}>
				<style>{`
					@keyframes rise {
						from { opacity: 0; transform: translateY(12px); }
						to { opacity: 1; transform: translateY(0); }
					}
				`}</style>

				<header
					style={{
						display: 'grid',
						gap: 12,
						marginBottom: 22,
					}}
				>
					<p
						style={{
							margin: 0,
							fontSize: 12,
							letterSpacing: '0.4px',
							textTransform: 'uppercase',
							color: '#94a3b8',
						}}
					>
						MindScape support list
					</p>
					<h1
						style={{
							margin: 0,
							fontSize: '2.4rem',
							color: '#fbbf24',
							fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
						}}
					>
						Psychologists and Counselors
					</h1>
					<p style={{ margin: 0, color: '#dbeafe', fontSize: 16, maxWidth: 720 }}>
						Ei page e sample contact list deya ache. Real helpline number gula add korte chaile list pathan — ami update kore dibo.
					</p>
				</header>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
						gap: 16,
						marginBottom: 26,
					}}
				>
					<div style={{ ...cardBase, borderColor: 'rgba(250, 204, 21, 0.28)' }}>
						<span style={labelBase}>Quick note</span>
						<p style={{ ...valueBase, margin: 0, lineHeight: 1.6 }}>
							Jodi immediate danger feel koren, local emergency services er sathe jogajog korun. Regular support er jonno nicher list ta use korte paren.
						</p>
					</div>
					<div style={{ ...cardBase, borderColor: 'rgba(56, 189, 248, 0.3)' }}>
						<span style={labelBase}>How to choose</span>
						<p style={{ ...valueBase, margin: 0, lineHeight: 1.6 }}>
							Psychologist-ra diagnosis o therapy dey; counselor-ra practical coping, relationship, o stress support dey. Apnar dorkar onujayi choose korun.
						</p>
					</div>
				</div>

				<div style={{ display: 'grid', gap: 28 }}>
					<div style={{ display: 'grid', gap: 16 }}>
						<SectionHeader
							title="Psychologists"
							subtitle="Clinical and counseling psychology support"
							accent="#fde68a"
						/>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
								gap: 16,
							}}
						>
							{psychologists.map((item, idx) => (
								<div key={`${item.name}-${idx}`} style={{ ...cardBase, borderColor: 'rgba(250, 204, 21, 0.35)', animationDelay: `${idx * 0.06}s` }}>
									<div>
										<h3
											style={{
												margin: 0,
												color: '#f8fafc',
												fontSize: 18,
												fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
											}}
										>
											{item.name}
										</h3>
										<p style={{ margin: '4px 0 0', color: '#cbd5f5', fontSize: 13 }}>{item.role}</p>
									</div>
									<div style={{ display: 'grid', gap: 6 }}>
										<span style={labelBase}>Focus</span>
										<span style={valueBase}>{item.focus}</span>
									</div>
									<div style={{ display: 'grid', gap: 6 }}>
										<span style={labelBase}>Phone</span>
										<span style={{ ...valueBase, fontSize: 16, color: '#fde68a' }}>{item.phone}</span>
									</div>
									<div style={{ display: 'grid', gap: 6 }}>
										<span style={labelBase}>Hours</span>
										<span style={valueBase}>{item.hours}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#94a3b8', fontSize: 12 }}>
										<span>{item.mode}</span>
										<span>{item.location}</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<div style={{ display: 'grid', gap: 16 }}>
						<SectionHeader
							title="Counselors"
							subtitle="Practical guidance and emotional support"
							accent="#7dd3fc"
						/>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
								gap: 16,
							}}
						>
							{counselors.map((item, idx) => (
								<div key={`${item.name}-${idx}`} style={{ ...cardBase, borderColor: 'rgba(56, 189, 248, 0.4)', animationDelay: `${(idx + 3) * 0.06}s` }}>
									<div>
										<h3
											style={{
												margin: 0,
												color: '#f8fafc',
												fontSize: 18,
												fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
											}}
										>
											{item.name}
										</h3>
										<p style={{ margin: '4px 0 0', color: '#cbd5f5', fontSize: 13 }}>{item.role}</p>
									</div>
									<div style={{ display: 'grid', gap: 6 }}>
										<span style={labelBase}>Focus</span>
										<span style={valueBase}>{item.focus}</span>
									</div>
									<div style={{ display: 'grid', gap: 6 }}>
										<span style={labelBase}>Phone</span>
										<span style={{ ...valueBase, fontSize: 16, color: '#7dd3fc' }}>{item.phone}</span>
									</div>
									<div style={{ display: 'grid', gap: 6 }}>
										<span style={labelBase}>Hours</span>
										<span style={valueBase}>{item.hours}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#94a3b8', fontSize: 12 }}>
										<span>{item.mode}</span>
										<span>{item.location}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Helpline
