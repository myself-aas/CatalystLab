import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { ENGINES_MAP } from '../../data/engines';

export const EnzymeGrid: React.FC = () => {
  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground">Diagnostic Engines</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Explore our suite of security and performance audit tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(ENGINES_MAP).map(([id, engine]) => (
            <Link key={id} to={`/engine/${id}`} className="block group bg-muted border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="mb-4">
                <engine.icon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">{engine.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4 line-clamp-2">{engine.description}</p>
              <div className="flex items-center text-emerald-500 text-sm font-semibold">
                Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
