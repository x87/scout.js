import { eLoopType } from 'common/enums';

import * as loopUtils from '../loop-utils';
import * as graphUtils from '../graph-utils';
import { complexGraph, ifNestedInLoop } from './graph.sample';
import { LoopGraph } from '../loop-utils';
import { GraphNode } from '../graph';
import { IfGraph } from '../conditions-utils';

describe('Loop utils', () => {
  it('structure shall collapse nodes of the given graph into a single LoopGraph node', () => {
    const graph = graphUtils.reversePostOrder(complexGraph());
    const reduced = loopUtils.structure(graph);
    const loop1 = reduced.nodes[5] as LoopGraph<GraphNode<number>>;
    expect(loop1 instanceof LoopGraph).toBeTrue();
    const loop2 = loop1.nodes[2] as LoopGraph<GraphNode<number>>;
    expect(loop2 instanceof LoopGraph).toBeTrue();
  });

  it('getLoopType shall determine loop type based on input parameters', () => {
    const graph = graphUtils.reversePostOrder(complexGraph());
    const reduced = loopUtils.structure(graph);
    const loop1 = reduced.nodes[5] as LoopGraph<GraphNode<number>>;
    const loop2 = loop1.nodes[2] as LoopGraph<GraphNode<number>>;
    const loopType1 = loopUtils.getLoopType(
      graph,
      loop1,
      graph.nodes[5],
      graph.nodes[9]
    );
    expect(loopType1).toEqual(eLoopType.PRE_TESTED);
    const loopType2 = loopUtils.getLoopType(
      graph,
      loop2,
      graph.nodes[7],
      graph.nodes[8]
    );
    expect(loopType2).toEqual(eLoopType.POST_TESTED);
  });

  it('findFollowNode shall find a node after the given loop if there is one', () => {
    const graph = graphUtils.reversePostOrder(complexGraph());
    const reduced = loopUtils.structure(graph);
    const loop1 = reduced.nodes[5] as LoopGraph<GraphNode<number>>;
    const loop2 = loop1.nodes[2] as LoopGraph<GraphNode<number>>;
    const followNode1 = loopUtils.findFollowNode(
      graph,
      loop1,
      graph.nodes[5],
      graph.nodes[9]
    );
    expect(followNode1).toEqual(graph.nodes[10]);
    const followNode2 = loopUtils.findFollowNode(
      graph,
      loop2,
      graph.nodes[7],
      graph.nodes[8]
    );
    expect(followNode2).toEqual(graph.nodes[9]);
  });

  it('should properly identify a conditional branch inside a loop', () => {
    const graph = graphUtils.reversePostOrder(ifNestedInLoop());

    const reduced = loopUtils.structure(graph);
    expect(reduced.nodes.length).toBe(3);

    const loop = reduced.nodes[1] as LoopGraph<GraphNode<number>>;
    expect(loop).toBeInstanceOf(LoopGraph);

    const loopType = loopUtils.getLoopType(
      graph,
      loop,
      graph.nodes[1],
      graph.nodes[5]
    );
    expect(loopType).toBe(eLoopType.PRE_TESTED);
    expect(loop.nodes[2]).toBeInstanceOf(IfGraph);
  });
});
