import { pageBgStyles } from '../styles/pageBackground'
import DoctorCard from '../components/DoctorCard'

const indianDoctors = [
	{
		doctorName: 'Dr. Ananya Sharma',
		qualification: 'MD Psychiatry, Senior Consultant Psychologist',
		hospitalName: 'Apollo Hospitals, Chennai',
		specializationTags: ['Anxiety', 'Sleep', 'Trauma'],
		city: 'Chennai',
		availability: 'Online / In-person',
		officialProfileUrl: 'https://www.apollohospitals.com/doctors/',
		appointmentUrl: 'https://www.apollohospitals.com/book-an-appointment/',
	},
	{
		doctorName: 'Dr. Rohan Mehta',
		qualification: 'DPM, Consultant Clinical Psychologist',
		hospitalName: 'Fortis Memorial Research Institute',
		specializationTags: ['Stress', 'Burnout', 'Workplace support'],
		city: 'Gurugram',
		availability: 'In-person',
		officialProfileUrl: 'https://www.fortishealthcare.com/doctors',
		appointmentUrl: 'https://www.fortishealthcare.com/appointment-booking',
	},
	{
		doctorName: 'Dr. Neha Iyer',
		qualification: 'MPhil Clinical Psychology',
		hospitalName: 'Max Super Speciality Hospital',
		specializationTags: ['Adolescent care', 'Family therapy', 'Mood disorders'],
		city: 'New Delhi',
		availability: 'Online / In-person',
		officialProfileUrl: 'https://www.maxhealthcare.in/doctors',
		appointmentUrl: 'https://www.maxhealthcare.in/book-an-appointment',
	},
	{
		doctorName: 'Dr. Vikram Nair',
		qualification: 'PhD Psychology, Consultant Psychotherapist',
		hospitalName: 'Manipal Hospitals',
		specializationTags: ['Couples therapy', 'Grief', 'Self-esteem'],
		city: 'Bengaluru',
		availability: 'Online',
		officialProfileUrl: 'https://www.manipalhospitals.com/doctors/',
		appointmentUrl: 'https://www.manipalhospitals.com/book-an-appointment/',
	},
]

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

				<header style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
					<p style={{ margin: 0, fontSize: 12, letterSpacing: '0.4px', textTransform: 'uppercase', color: '#94a3b8' }}>
						MindScape support list
					</p>
					<h1 style={{ margin: 0, fontSize: '2.4rem', color: '#fbbf24', fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
						Indian psychologist directory
					</h1>
					<p style={{ margin: 0, color: '#dbeafe', fontSize: 16, maxWidth: 760, lineHeight: 1.7 }}>
						These are reusable sample cards for Indian users only. Each card can be wired to a real hospital profile and appointment link without changing the component.
					</p>
				</header>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
						gap: 18,
					}}
				>
					{indianDoctors.map((doctor, index) => (
						<DoctorCard key={`${doctor.doctorName}-${index}`} {...doctor} />
					))}
				</div>
			</section>
		</div>
	)
}

export default Helpline
