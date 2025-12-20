export function Simulations() {
    return (
        <div>
            <div className="absolute z-20">Hello</div>
            <iframe
                src="http://127.0.0.1:5500/simulations/1.SHM.html"
                className="absolute z-10 top-0 h-screen w-full border-none"
                title="Wave Speed Simulation"
            />
        </div>
    )
}