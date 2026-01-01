import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PlayCircle, Lock, ExternalLink } from "lucide-react";
import { Task } from "@shared/schema";
import { useCompleteTask } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task & { completed: boolean };
}

export function TaskCard({ task }: TaskCardProps) {
  const { toast } = useToast();
  // We don't expose manual complete to users, handled via postback
  // But for demo purposes or admin testing we might use it
  
  const handleStartTask = () => {
    window.open(task.smartLink, '_blank');
    toast({
      title: "Task Started",
      description: "Complete the offer in the new tab to earn rewards.",
    });
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${task.completed ? 'opacity-80' : 'border-primary/20'}`}>
      {task.completed && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-full border border-green-500/20 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Completed
            </div>
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Badge variant={task.completed ? "secondary" : "default"} className="mb-2">
          {task.completed ? "Done" : "Available"}
        </Badge>
        <span className="font-mono text-2xl font-bold text-primary">
          ${Number(task.rewardAmount).toFixed(2)}
        </span>
      </CardHeader>
      
      <CardContent>
        <h3 className="text-xl font-bold mb-2">{task.tagName}</h3>
        <p className="text-sm text-muted-foreground">
          Complete the offer to earn USDT. Valid for {task.country}.
        </p>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleStartTask} 
          disabled={task.completed}
          className="w-full gap-2 shadow-lg shadow-primary/20"
          size="lg"
        >
          {task.completed ? (
            <>
              <Lock className="w-4 h-4" /> Locked
            </>
          ) : (
            <>
              Start Task <ExternalLink className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
