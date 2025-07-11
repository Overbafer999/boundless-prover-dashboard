const ProverCard = ({ prover, index }: { prover: ProverData; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gradient-to-br from-boundless-card/60 to-boundless-card/40 backdrop-blur-sm rounded-2xl p-6 border border-boundless-accent/20 hover:border-boundless-accent/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-boundless-accent/10 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-boundless-accent/5 to-boundless-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-boundless-neon/20 to-transparent rounded-bl-3xl" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-1">{prover.name}</h3>
            <p className="text-xs text-gray-400">{prover.gpu} • {prover.location}</p>
          </div>
          <StatusBadge status={prover.status} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Earnings:</span>
              <motion.span 
                className="font-bold text-boundless-accent"
                whileHover={{ scale: 1.1 }}
              >
                ${prover.earnings.toFixed(2)}
              </motion.span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Hash Rate:</span>
              <span className="font-bold text-boundless-neon">{prover.hashRate} H/s</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Uptime:</span>
              <span className="font-bold text-boundless-success">{prover.uptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Status:</span>
              <motion.div
                animate={{ 
                  scale: prover.status === 'online' ? [1, 1.1, 1] : 1 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${
                  prover.status === 'online' ? 'bg-emerald-400' :
                  prover.status === 'busy' ? 'bg-blue-400' : 'bg-red-400'
                }`}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-600/30">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Last active: {new Date(prover.lastActive).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
