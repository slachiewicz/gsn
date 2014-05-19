package gsn.beans;

import gsn.VirtualSensor;

import java.io.Serializable;

public class OutputStream implements Serializable {
	
	private transient static int counter = 0;

	private static final long serialVersionUID = 1L;
	
	private DataField[] structure;
	
	private transient VirtualSensor virtualsensor;
	
	private String outputStreamName;

	public DataField[] getStructure() {
		return structure;
	}

	public VirtualSensor getVirtualsensor() {
		return virtualsensor;
	}

	public void setVirtualsensor(VirtualSensor virtualsensor) {
		this.virtualsensor = virtualsensor;
	}

	public String getOutputStreamName() {
		if (outputStreamName == null){
			counter ++;
			outputStreamName = "UnnammedOutputStream"+counter;
		}
		return outputStreamName;
	}

	public void setOutputStreamName(String outputStreamName) {
		this.outputStreamName = outputStreamName;
	}

	public void setStructure(DataField[] structure) {
		this.structure = structure;
	}
	

}
